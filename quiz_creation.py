import json
import os
import random
import re

# --- 定数定義 ---

ANSWER_OPTIONS = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]

FRETBOARD_STRINGS = [
    "E |F |F#|G |Ab|A |Bb|B |C |C#|D |Eb|E |F |F#|G |Ab|A |Bb|B |C |C#|D ",
    "B |C |C#|D |Eb|E |F |F#|G |Ab|A |Bb|B |C |C#|D |Eb|E |F |F#|G |Ab|A ",
    "G |Ab|A |Bb|B |C |C#|D |Eb|E |F |F#|G |Ab|A |Bb|B |C |C#|D |Eb|E |F",
    "D |Eb|E |F |F#|G |Ab|A |Bb|B |C |C#|D |Eb|E |F |F#|G |Ab|A |Bb|B |C",
    "A |Bb|B |C |C#|D |Eb|E |F |F#|G |Ab|A |Bb|B |C |C#|D |Eb|E |F |F#|G",
    "E |F |F#|G |Ab|A |Bb|B |C |C#|D |Eb|E |F |F#|G |Ab|A |Bb|B |C |C#|D",
]

MAJOR_SEVENTH_QUALITIES = ["maj7", "m7", "7", "m7b5"]

CIRCLE_OF_FIFTHS_LIST = [
    ["C", "Am", 0, "なし"],
    ["G", "Em", 1, "シャープ(♯)"],
    ["D", "Bm", 2, "シャープ(♯)"],
    ["A", "F#m", 3, "シャープ(♯)"],
    ["E", "C#m", 4, "シャープ(♯)"],
    ["B", "G#m", 5, "シャープ(♯)"],
    ["F#", "D#m", 6, "シャープ(♯)"],
    ["F", "Dm", 1, "フラット(♭)"],
    ["Bb", "Gm", 2, "フラット(♭)"],
    ["Eb", "Cm", 3, "フラット(♭)"],
    ["Ab", "Fm", 4, "フラット(♭)"],
    ["Db", "Bbm", 5, "フラット(♭)"],
    ["Gb", "Ebm", 6, "フラット(♭)"],
]

MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11]
DEGREE_ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"]
DIATONIC_QUALITIES_MAJOR_KEY = ["maj7", "m7", "m7", "maj7", "7", "m7", "m7b5"]

TENSION_INTERVALS = {
    "9th": 14,
    "b9th": 13,
    "#9th": 15,
    "11th": 17,
    "b11th": 16,
    "#11th": 18,
    "13th": 21,
    "b13th": 20,
    "#13th": 22,
}

KEY_SIGNATURE_CHOICES = [
    "シャープ・フラットなし",
    "シャープ(♯)1つ",
    "シャープ(♯)2つ",
    "シャープ(♯)3つ",
    "シャープ(♯)4つ",
    "シャープ(♯)5つ",
    "シャープ(♯)6つ",
    "フラット(♭)1つ",
    "フラット(♭)2つ",
    "フラット(♭)3つ",
    "フラット(♭)4つ",
    "フラット(♭)5つ",
    "フラット(♭)6つ",
]

NOTE_TO_INDEX = {
    "C": 0,
    "C#": 1,
    "Db": 1,
    "D": 2,
    "D#": 3,
    "Eb": 3,
    "E": 4,
    "F": 5,
    "F#": 6,
    "Gb": 6,
    "G": 7,
    "G#": 8,
    "Ab": 8,
    "A": 9,
    "A#": 10,
    "Bb": 10,
    "B": 11,
}

NOTES_PREFERRED = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]

INTERVALS = {
    "maj7": [0, 4, 7, 11],
    "m7": [0, 3, 7, 10],
    "7": [0, 4, 7, 10],
    "m7b5": [0, 3, 6, 10],
    "dim7": [0, 3, 6, 9],
    "aug7": [0, 4, 8, 10],
    "mMaj7": [0, 3, 7, 11],
    "6": [0, 4, 7, 9],
    "m6": [0, 3, 7, 9],
    "add9": [0, 4, 7, 14],
    "madd9": [0, 3, 7, 14],
    "sus4": [0, 5, 7],
    "sus2": [0, 2, 7],
}

# --- 関数定義 ---


def parse_chord(chord_str: str) -> tuple[str, str] | None:
    match = re.match(
        r"^([A-G][#b]?)(m?M?aj7|m7b5|dim7|aug7|madd9|add9|sus4|sus2|m6|maj7|m7|7|6)$",
        chord_str,
    )
    return (match.group(1), match.group(2)) if match else None


def get_chord_notes(chord_str: str) -> list[str] | None:
    parsed_code = parse_chord(chord_str)
    if not parsed_code:
        return None
    root_note, quality = parsed_code
    if root_note not in NOTE_TO_INDEX or quality not in INTERVALS:
        return None

    root_index = NOTE_TO_INDEX[root_note]
    intervals = INTERVALS[quality]
    return [NOTES_PREFERRED[(root_index + interval) % 12] for interval in intervals]


def create_guitar_fretboard_q(qa_list):
    fretboard_2d = [s.replace(" ", "").split("|") for s in FRETBOARD_STRINGS]
    for gen, gen_val in enumerate(fretboard_2d):
        for flet, flet_val in enumerate(gen_val):
            if 1 <= flet <= 12 and flet_val:
                qa_list.append(
                    {
                        "question": f"ギターの{gen + 1}弦、{flet}フレットの音は何？",
                        "correct": flet_val,
                        "choices": ANSWER_OPTIONS,
                    }
                )


def create_chord_notes_q(qa_list):
    for note in ANSWER_OPTIONS:
        for q in MAJOR_SEVENTH_QUALITIES:
            chord_str = f"{note}{q}"
            results = get_chord_notes(chord_str)
            if results and len(results) >= 4:
                qa_list.append(
                    {
                        "question": f"{chord_str}コードの3rdの音は何？",
                        "correct": results[1],
                        "choices": ANSWER_OPTIONS,
                    }
                )
                qa_list.append(
                    {
                        "question": f"{chord_str}コードの5thの音は何？",
                        "correct": results[2],
                        "choices": ANSWER_OPTIONS,
                    }
                )
                qa_list.append(
                    {
                        "question": f"{chord_str}コードの7thの音は何？",
                        "correct": results[3],
                        "choices": ANSWER_OPTIONS,
                    }
                )


def create_diatonic_chords_q(qa_list):
    for key_note in ANSWER_OPTIONS:
        key_root_index = NOTE_TO_INDEX[key_note]
        for i in range(1, 7):
            degree_root_index = (key_root_index + MAJOR_SCALE_INTERVALS[i]) % 12
            degree_root_note = NOTES_PREFERRED[degree_root_index]
            degree_quality = DIATONIC_QUALITIES_MAJOR_KEY[i]
            correct_answer = f"{degree_root_note}{degree_quality}"

            choices = {correct_answer}
            while len(choices) < 12:
                random_root = random.choice(ANSWER_OPTIONS)
                random_quality = random.choice(MAJOR_SEVENTH_QUALITIES)
                choices.add(f"{random_root}{random_quality}")

            shuffled_choices = random.sample(list(choices), len(choices))

            qa_list.append(
                {
                    "question": f"{key_note}キーでダイアトニックコード（四和音）の{DEGREE_ROMAN[i]}は何？",
                    "correct": correct_answer,
                    "choices": shuffled_choices,
                }
            )


def create_tension_notes_q(qa_list):
    for root_note in ANSWER_OPTIONS:
        root_index = NOTE_TO_INDEX[root_note]
        for tension_name, interval in TENSION_INTERVALS.items():
            note_index = (root_index + interval) % 12
            correct_answer = NOTES_PREFERRED[note_index]
            qa_list.append(
                {
                    "question": f"ルート音が{root_note}の場合、{tension_name}の音は何？",
                    "correct": correct_answer,
                    "choices": ANSWER_OPTIONS,
                }
            )


def create_key_signature_q(qa_list):
    for major_key, minor_key, num, acc_type in CIRCLE_OF_FIFTHS_LIST:
        correct_answer = "シャープ・フラットなし" if num == 0 else f"{acc_type}{num}つ"
        qa_list.append(
            {
                "question": f"キーが{major_key}の場合の調号は何？",
                "correct": correct_answer,
                "choices": KEY_SIGNATURE_CHOICES,
            }
        )
        qa_list.append(
            {
                "question": f"キーが{minor_key}の場合の調号は何？",
                "correct": correct_answer,
                "choices": KEY_SIGNATURE_CHOICES,
            }
        )


# --- メイン処理 ---


def main():
    qa = []
    create_guitar_fretboard_q(qa)
    create_chord_notes_q(qa)
    create_diatonic_chords_q(qa)
    create_tension_notes_q(qa)
    create_key_signature_q(qa)

    output_dir = "./public"
    output_path = os.path.join(output_dir, "qa.json")

    # 出力ディレクトリが存在しない場合は作成
    os.makedirs(output_dir, exist_ok=True)

    # JSONファイルに書き出し
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(qa, f, ensure_ascii=False, indent=4)

    print(f"問題を生成し、{output_path} に保存しました。")


if __name__ == "__main__":
    main()

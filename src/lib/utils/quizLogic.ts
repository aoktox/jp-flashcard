export type QuizQuestion = {
	display: string;
	correct: string;
	options: string[];
	example?: string;
	exampleDisplay?: string;
};

export function shuffle<T>(array: T[]): T[] {
	const a = [...array];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

export function generateOptions(correct: string, allAnswers: string[], count = 4): string[] {
	const others = allAnswers.filter((a) => a !== correct);
	const selected = shuffle(others).slice(0, count - 1);
	return shuffle([correct, ...selected]);
}

export type WrongTracker = Map<number, number>;

export function buildQuizQueue(
	questions: QuizQuestion[],
	wrongTracker: WrongTracker
): QuizQuestion[] {
	const base = shuffle(questions);
	const extra: QuizQuestion[] = [];
	for (const [idx, count] of wrongTracker) {
		const remaining = 3 - count;
		if (remaining > 0 && questions[idx]) {
			for (let i = 0; i < remaining; i++) {
				extra.push(questions[idx]);
			}
		}
	}
	return [...base, ...shuffle(extra)];
}

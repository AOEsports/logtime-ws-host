const bars: Record<string, ProgressBar> = {};

function createProgressBar(label: string, totalSteps: number): ProgressBar {
	const progressBar = new ProgressBar(label, totalSteps);
	bars[label] = progressBar;
	return progressBar;
}

function updateProgressBar(label: string, progress: number): void {
	if (bars[label]) {
		bars[label].update(progress);
	} else {
		console.error(`Progress bar with label "${label}" not found.`);
	}
}
class ProgressBar {
	private label: string;
	private totalSteps: number;
	private currentStep: number = 0;

	constructor(label: string, totalSteps: number) {
		this.label = label;
		this.totalSteps = totalSteps;
	}

	update(progress: number): void {
		this.currentStep = Math.min(this.totalSteps, Math.max(0, progress));
		this.render();
	}

	render(): void {
		const percentage = ((this.currentStep / this.totalSteps) * 100).toFixed(
			2
		);
		const progressBarWidth = Math.floor(
			(this.currentStep / this.totalSteps) * 20
		);
		const progressBar =
			"[" +
			"=".repeat(progressBarWidth) +
			".".repeat(20 - progressBarWidth) +
			"]";

		process.stdout.write(`\r${this.label}  ${percentage}% ${progressBar}`);
	}
}

const timeTracker: { [key: string]: number } = {};

const time = (label: string) => {
	timeTracker[label] = Date.now();
	console.time(`\x1b[36m[TIME] \x1b[39m${label}`);
	return true;
};

const timeEnd = (label: string) => {
	const time = Date.now() - timeTracker[label];
	console.timeEnd(`\x1b[36m[TIME] \x1b[39m${label}`);
	return time;
};

const log = (message: any, prefix?: string, ...everythingElse) => {
	const currentTimestamp = new Date().toLocaleTimeString();
	console.log(
		`\x1b[36m[LOG] ${currentTimestamp} ${
			prefix ? `${prefix} ` : ""
		}\x1b[39m`,
		message,
		...everythingElse
	);
};

const warn = (message: any, prefix?: string, ...everythingElse) => {
	const currentTimestamp = new Date().toLocaleTimeString();
	console.warn(
		`\x1b[33m[WARN] ${currentTimestamp} ${
			prefix ? `${prefix} ` : ""
		}\x1b[39m`,
		message,
		...everythingElse
	);
};

const error = (message: any, prefix?: string, ...everythingElse) => {
	const currentTimestamp = new Date().toLocaleTimeString();
	console.error(
		`\x1b[31m[ERROR] ${currentTimestamp} ${
			prefix ? `${prefix} ` : ""
		}\x1b[39m`,
		message,
		...everythingElse
	);
};

const success = (message: any, prefix?: string, ...everythingElse) => {
	const currentTimestamp = new Date().toLocaleTimeString();
	console.log(
		`\x1b[32m[SUCCESS] ${currentTimestamp} ${
			prefix ? `${prefix} ` : ""
		}\x1b[39m`,
		message,
		...everythingElse
	);
};

const info = (message: any, prefix?: string, ...everythingElse) => {
	const currentTimestamp = new Date().toLocaleTimeString();
	console.log(
		`\x1b[34m[INFO] ${currentTimestamp} ${
			prefix ? `${prefix} ` : ""
		}\x1b[39m`,
		message,
		...everythingElse
	);
};

const debug = (message: any, prefix?: string, ...everythingElse) => {
	const currentTimestamp = new Date().toLocaleTimeString();
	console.log(
		`\x1b[35m[DEBUG] ${currentTimestamp} ${
			prefix ? `${prefix} ` : ""
		}\x1b[39m`,
		message,
		...everythingElse
	);
};

const trace = (message: any, prefix?: string, ...everythingElse) => {
	const currentTimestamp = new Date().toLocaleTimeString();
	console.log(
		`\x1b[90m[TRACE] ${currentTimestamp} ${
			prefix ? `${prefix} ` : ""
		}\x1b[39m`,
		message,
		...everythingElse
	);
};

export const logger = {
	time,
	timeEnd,
	log,
	warn,
	error,
	success,
	info,
	debug,
	trace,
	createProgressBar,
	updateProgressBar,
};

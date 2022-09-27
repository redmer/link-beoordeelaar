// // @ts-check
// /// <reference path="../types/configuration.d.ts" />

// import label from "../util/lang";
// import pick from "../util/filtered-object";
// import slugify from "../util/slugify";

// export default class Questionnaire {
//   configurationURL: URL;
//   _answers: any[];
//   isLoaded: boolean;
//   _data: any;

//   /**
//    * Model class that loads and proxies the configuration data from the url.
//    *
//    * @param {string} url The URL to GET the configuration from.
//    */
//   constructor(url: string) {
//     this.configurationURL = new URL(url);
//     this._answers = [];
//   }

//   /** Load data from URL and perform sanity checks. */
//   async load(cache = true) {
//     const response = await fetch(this.configurationURL, {
//       redirect: "follow",
//       cache: cache ? "default" : "no-cache",
//     });
//     const parsedConfig: QuestionnaireData = JSON.parse(await response.text());

//     if (!parsedConfig.hasOwnProperty("subjects")) {
//       throw new SchemaValidationError("`subjects` array missing");
//     }

//     if (!parsedConfig.hasOwnProperty("reporting")) {
//       throw new SchemaValidationError("`reporting` key missing");
//     }

//     this.isLoaded = true;
//     /** @type {Configuration} */
//     this._data = {
//       help: label("HELP_URL"),
//       keys: [],
//       introductionText: label("INTRODUCTION"),
//       closingText: label("CLOSING_REMARKS_MAIL"),
//       ...parsedConfig,
//     };
//   }

//   interfaceConfiguration() {
//     if (!this._data) throw new PropertyAccessError();

//     return {
//       language: this._data.lang,
//       helpLink: this._data.help,
//       possibleAnswers: this.answerOptions,
//     };
//   }

//   get answerOptions() {
//     if (!this._data) throw new PropertyAccessError();

//     return this._data.answerOptions.map((opt, n) => {
//       if (opt.hasOwnProperty("value")) return opt;
//       return { ...opt, value: slugify(opt.name) };
//     });
//   }

//   get answers() {
//     return this._answers;
//   }

//   /**
//    * Link subjects, with keys filtered based on JSON's.keys
//    *
//    * @returns {Generator<{ url: string; [key: string]: string | number | null }, void, unknown>}
//    */
//   *subjects(): Generator<Subject, void, unknown> {
//     if (!this._data) throw new PropertyAccessError();

//     if (this._data?.keys.length == 0) {
//       yield* this._data.subjects;
//       return;
//     }

//     for (const subj of this._data.subjects) {
//       yield* pick(subj, { allowed: ["url", ...this._data.keys] });
//       // yield Object.keys(subj)
//       //   .filter((key) => key == "url" || this._data.keys.includes(key))
//       //   .reduce((filteredObj, key) => {
//       //     filteredObj[key] = subj[key];
//       //     return filteredObj;
//       //   }, {});
//     }
//   }

//   saveAnswer({ index, value }) {
//     this._answers[index] = value;
//   }

//   reportAnswers() {
//     if (!this._data.reporting.endpoint) {
//       throw new ReportingError();
//     }

//     // Prepare payload, by getting reporting keys for the Subjects
//     let subjects = this._data.subjects;
//     if (this._data.reporting.keys) {
//       subjects = pick(subjects, this._data.reporting.keys);
//       // for (const subj of this._data.subjects) {
//       //   subjects.push(
//       //     Object.keys(subj)
//       //       .filter(this._data.reporting.keys.includes(key))
//       //       .reduce((filteredObj, key) => {
//       //         filteredObj[key] = subj[key];
//       //         return filteredObj;
//       //       }, {})
//       //   );
//       // }
//     }

//     fetch(this._data.reporting.endpoint);
//   }
// }

// /** Error when .accessing before calling -load */
// export class PropertyAccessError extends Error {
//   constructor(message = "Property access before calling Questionnaire#load") {
//     super(message);
//     this.name = "PropertyAccessError";
//   }
// }

// /** Error when JSON-schema validation fails */
// export class SchemaValidationError extends Error {
//   constructor(message) {
//     super(
//       `Session configuration JSON is invalid (d626ac4b-fbef-46bf-af96-50c1d6ac926b): ${message}`
//     );
//     this.name = "SchemaValidationError";
//   }
// }

// export class ReportingError extends Error {
//   constructor(
//     message = "Programming error: cannot report over HTTP, as no endpoint is supplied"
//   ) {
//     super(message);
//     this.name = "ReportingError";
//   }
// }

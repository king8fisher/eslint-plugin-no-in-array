import { noInArray } from "./rules/no-in-array";

const plugin = {
  rules: {
    "no-in-array": noInArray,
  },
};

export default plugin;
export { noInArray };
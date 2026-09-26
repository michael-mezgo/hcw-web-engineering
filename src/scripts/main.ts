import { loadBears } from "./bears.js";
import searchBears from "./search.js";
import comments from "./comments.js";

loadBears().catch((): void => {
    // Error already reported to the user inside loadBears().
});
searchBears();
comments();

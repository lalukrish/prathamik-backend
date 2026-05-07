import { JSDOM } from "jsdom";

export const extractTextFromHTML = (html: string) => {
    const dom = new JSDOM(html);
    return dom.window.document.body.textContent || "";
};
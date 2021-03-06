'use strict';

// Load the Myna module 
let myna = require('../myna');

// Load the Myna markdown grammar module 
let mdGrammar = require('../grammars/grammar_markdown')(myna);

// Returns the HTML for a start tag
function startTag(tag, attr) {
    let attrStr = "";
    if (attr) {
        attrStr = " " + Object.keys(attr).map(function(k) { 
            return k + ' = "' + attr[k] + '"';
        }).join(" ");
    }
    return "<" + tag + attrStr + ">";
}

// Returns the HTML for an end tag
function endTag(tag) {
    return "</" + tag + ">";
}

// Returns 
function markdownAstToHtml(ast, lines) {
    if (lines == undefined)
        lines = [];

    // Adds each element of the array as markdown 
    function addArray(ast) {
        for (let child of ast)
            markdownAstToHtml(child, lines);
        return lines;
    }

    // Adds tagged content 
    function addTag(tag, ast, newLine) {
        lines.push(startTag(tag));
        if (ast instanceof Array)
            addArray(ast); 
        else
            markdownAstToHtml(ast, lines);
        lines.push(endTag(tag));
        if (newLine)
            lines.push('\r\n');
        return lines;
    }

    function addLink(url, ast) {
        lines.push(startTag('a', { href:url }));
        addArray(ast.children);
        lines.push(endTag('a')) ;
        return lines;
    }

    function addImg(url) {
        lines.push(startTag('img', { src:url }));
        lines.push(endTag('img')) ;
        return lines;
    }

    switch (ast.name)
    {
        case "heading": 
            {
                let headingLevel = ast.children[0];
                let restOfLine = ast.children[1];
                let h = headingLevel.allText.length;
                switch (h)
                {
                    case 1: return addTag("h1", restOfLine, true); 
                    case 2: return addTag("h2", restOfLine, true); 
                    case 3: return addTag("h3", restOfLine, true); 
                    case 4: return addTag("h4", restOfLine, true); 
                    case 5: return addTag("h5", restOfLine, true); 
                    case 6: return addTag("h6", restOfLine, true); 
                    default: throw "Heading level must be from 1 to 6"
                }
            }
        case "paragraph":
            return addTag("p", ast.children, true);
        case "list":
            return addTag("ul", ast.children, true);
        case "unorderedListItem":
            return addTag("li", ast.children, true);
        case "orderedListItem":
            return addTag("li", ast.children, true);
        case "bold":
            return addTag("b", ast.children);
        case "italic":
            return addTag("i", ast.children);
        case "code":
            return addTag("code", ast.children);
        case "quote":
            return addTag("blockquote", ast.children, true);
        case "link":
            return addLink(ast.children[1].allText, ast.children[0]);
        case "image":
            return addImg(ast.children[0]);
        default:
            if (ast.isLeaf)
                lines.push(ast.allText);
            else 
                ast.children.forEach(function(c) { markdownAstToHtml(c, lines); });
    }
    return lines;
}

// Outputs a parse tree given a string 
function markdownToHtml(input) {
    let rule = myna.allRules['markdown.document'];
    let ast = myna.parse(rule, input);
    let lines = markdownAstToHtml(ast, []);    
    return lines.join("");
}

// Export the function for use with Node.js
if (typeof module === "object" && module.exports) 
    module.exports = markdownToHtml;

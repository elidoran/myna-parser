'use strict';

// Define a grammar for common HTML reserved chars. Those are characters like <, >, and & that should be
// be replaced by an HTML entity to be displayed correctly.
function CreateHtmlReservedCharsGrammar(myna) 
{
    let m = myna;
    
    let g = new function() 
    {
        let escapeChars = '&<>"\'';        
        this.specialChar = m.advance.ast;
        this.plainText = m.charExcept(escapeChars).oneOrMore.ast;
        this.text = m.lookup(escapeChars, this.specialChar, this.plainText).zeroOrMore;
    }

    // Register the grammar with m.
    // This sets the names of the rules, and makes the grammar accessible 
    return m.registerGrammar('html_reserved_chars', g);
}

// Export the main function for usage by Node.js and CommonJs compatible module loaders 
if (typeof module === "object" && module.exports) 
    module.exports = CreateHtmlReservedCharsGrammar;
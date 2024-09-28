import React, { useEffect, useState } from "react";
import "./DocumentWindow";

export default function DocumentWindow() {
    const [htmlContent, setHtmlContent] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadAndTransformXml = async () => {
            try {
                // Load the XML file
                const xmlResponse = await fetch("/case.xml");
                const xmlText = await xmlResponse.text();

                // Load the XSL file
                const xslResponse = await fetch("/xsd/styl.xsl");
                const xslText = await xslResponse.text();

                console.log("everything is ok")
                // Transform XML using XSL
                const transformedHtml = transformXml(xmlText, xslText);
                setHtmlContent(transformedHtml);
            } catch (err) {
                console.log(err);
                setError("Error loading XML or XSL file.");
            }
        };

        loadAndTransformXml();
    }, []);

    const transformXml = (xmlText, xslText) => {
        // Create a new XSLT processor
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");
        const xslDoc = parser.parseFromString(xslText, "application/xml");

        // Check for parsing errors
        if (xmlDoc.getElementsByTagName("parsererror").length > 0 || 
            xslDoc.getElementsByTagName("parsererror").length > 0) {
            throw new Error("Error parsing XML or XSL.");
        }

        // Perform the transformation
        const xsltProcessor = new XSLTProcessor();
        xsltProcessor.importStylesheet(xslDoc);
        const resultDocument = xsltProcessor.transformToFragment(xmlDoc, document);

        // Return the transformed HTML
        const wrapper = document.createElement("div");
        wrapper.appendChild(resultDocument);
        return wrapper.innerHTML;
    };

    return (
        <div id="documentWindow">
            {error && <p style={{ color: "red" }}>{error}</p>}
            {htmlContent ? (
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            ) : (
                <p>Loading XML data...</p>
            )}
        </div>
    );
}
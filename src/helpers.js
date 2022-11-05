const kebabize = (str) => str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase());

const allowedHtmlAttributes = 'accept acceptCharset accessKey action allowFullScreen allowTransparency alt async autoComplete autoFocus autoPlay cellPadding cellSpacing charSet checked classID className colSpan cols content contentEditable contextMenu controls coords crossOrigin data dateTime defer dir disabled download draggable encType form formAction formEncType formMethod formNoValidate formTarget frameBorder headers height hidden high href hrefLang htmlFor httpEquiv icon id label lang list loop low manifest marginHeight marginWidth max maxLength media mediaGroup method min multiple muted name noValidate open optimum pattern placeholder poster preload radioGroup readOnly rel required role rowSpan rows sandbox scope scoped scrolling seamless selected shape size sizes span spellCheck src srcDoc srcSet start step style tabIndex target title type useMap value width wmode'.split(' ');
const allowedSvgAttributes = 'clipPath cx cy d dx dy fill fillOpacity fontFamily fillRule fontSize fx fy gradientTransform gradientUnits markerEnd markerMid markerStart offset opacity patternContentUnits patternUnits points preserveAspectRatio r rx ry spreadMethod stopColor stopOpacity stroke strokeDasharray strokeLinecap strokeLinejoin strokeMiterlimit strokeOpacity strokeWidth textAnchor transform vectorEffect version viewBox xmlns x1 x2 x y1 y2 y xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type xml:base xml:lang xml:space mask maskUnits'.split(' ');

const allowedSvgToJsxTags = 'circle clipPath defs ellipse g image line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan title style'.split(' ').join(', ');
const allowedFillTags = 'svg altGlyph circle ellipse path polygon polyline rect text textPath tref tspan'.split(' ').join(', ');

export const svg2jsx = (input) => {
	const parser = new DOMParser();
	const doc = parser.parseFromString(input, "image/svg+xml");

	doc.querySelectorAll(allowedSvgToJsxTags).forEach((el) => {
		if (!el.hasAttributes()) {
			return;
		}

		const allowedAttributes = [...allowedHtmlAttributes, ...allowedSvgAttributes]
			.reduce((attrs, current) => ({
				...attrs,
				[kebabize(current)]: current,
			}), {});

		[...el.attributes].filter((({ name }) => Object.keys(allowedAttributes).includes(name))).forEach(({ name, value }) => {
			el.removeAttribute(name);
			el.setAttribute(allowedAttributes[name], value);
		})
	});

	return doc.documentElement.outerHTML;
}

export const addFillNone = (input) => {
	const parser = new DOMParser();
	const doc = parser.parseFromString(input, "image/svg+xml");

	doc.querySelectorAll(allowedFillTags).forEach((el) => {
		if (!el.hasAttributes()) {
			return;
		}

		if (!el.hasAttribute('fill')) {
			el.setAttribute('fill', 'none');
		}
	});

	return doc.documentElement.outerHTML;
}
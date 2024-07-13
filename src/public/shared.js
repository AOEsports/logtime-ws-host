function smoothReplace(oldElement, newElement) {
	// smoothly replace one dom element with another. finding similarities between the two and only replacing what needs to be replaced
	// Create a document fragment to hold the new element
	const fragment = document.createDocumentFragment();
	fragment.appendChild(newElement);

	// Compare and update attributes
	const oldAttributes = Array.from(oldElement.attributes);
	const newAttributes = Array.from(newElement.attributes);

	oldAttributes.forEach((attr) => {
		if (!newElement.hasAttribute(attr.name)) {
			oldElement.removeAttribute(attr.name);
		}
	});

	newAttributes.forEach((attr) => {
		oldElement.setAttribute(attr.name, attr.value);
	});

	// Compare and update child nodes
	const oldChildren = Array.from(oldElement.childNodes);
	const newChildren = Array.from(newElement.childNodes);

	const maxLength = Math.max(oldChildren.length, newChildren.length);

	for (let i = 0; i < maxLength; i++) {
		if (!oldChildren[i]) {
			oldElement.appendChild(newChildren[i].cloneNode(true));
		} else if (!newChildren[i]) {
			oldElement.removeChild(oldChildren[i]);
		} else if (!oldChildren[i].isEqualNode(newChildren[i])) {
			oldElement.replaceChild(
				newChildren[i].cloneNode(true),
				oldChildren[i]
			);
		}
	}

	// Update the text content if it's different
	if (oldElement.textContent !== newElement.textContent) {
		oldElement.textContent = newElement.textContent;
	}
}

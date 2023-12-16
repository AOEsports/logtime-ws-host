function smoothReplace(oldElement, newElement) {
	// smoothly replace one dom element with another. finding similarities between the two and only replacing what needs to be replaced
	$(oldElement).replaceWith(newElement);
}

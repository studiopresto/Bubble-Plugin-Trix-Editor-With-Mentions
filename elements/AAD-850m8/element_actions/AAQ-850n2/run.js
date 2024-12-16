function(instance, properties, context) {
	const editor = document.querySelector(`#${instance.data.id}`);
    editor.editor.loadHTML('');
}
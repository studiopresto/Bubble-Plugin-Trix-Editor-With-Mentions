function(instance, context) {
    const getId = () => Math.random().toString(36).substr(2,9);
    
    let id = 'trix-' + getId();
    console.log(id);
    instance.data.id = id;
    
    $(instance.canvas).append(`<trix-editor id="${id}" class="form-control" style="overflow-y:auto"></trix-editor><div id="mention-dropdown" class="mention-dropdown"></div>`)
}


function(instance, properties, context) {
    var inputs = properties.data;
    var length = properties.data.length();
    const users = [];

    for (var itms=0; itms < length; itms++) {
      const thisInput = inputs.get(itms,1)[0];
      const username = thisInput.get(properties.name_field);
      const image = thisInput.get(properties.image_field);
        if (username) {
            users.push({
                id: `${thisInput.get('_id')}`,
                name: '@'+username.replace(' ', '_'),
                photo: image
            });
        }
    }
   
    
 	const selectedUsers = [];
    const editor = document.querySelector(`#${instance.data.id}`);
    //editor.editor.loadHTML(properties.initial_content);
    const mentionDropdown = document.getElementById('mention-dropdown');
    let mentionStartIndex = -1;

    // Оновлення атрибуту data-selected-users
    function updateSelectedUsersAttribute() {
        editor.setAttribute('data-selected-users', JSON.stringify(selectedUsers.map(user => user.id)));
        instance.publishState('mentioned_users', selectedUsers.map(user => user.id)); 
        
    }

    function getSelectedUsersFromEditor() {
        const selectedUserIds = JSON.parse(editor.getAttribute('data-selected-users') || '[]');
        return users.filter(user => selectedUserIds.includes(user.id));
    }
    


    editor.addEventListener('trix-change', (e) => {
        const editorContent = editor.editor.getDocument().toString();
        const cursorPosition = editor.editor.getPosition();
        instance.publishState('content', e.target.value); 

        // Перевірка, чи введено символ "@"
        if (cursorPosition > 0 && editorContent[cursorPosition - 1] === '@') {
            mentionStartIndex = cursorPosition - 1;
            showMentionDropdown(); // Показуємо список користувачів
            updateMentionDropdown(''); // Передаємо пустий рядок, щоб показати всіх
        } else if (mentionStartIndex >= 0) {
            const query = editorContent.slice(mentionStartIndex + 1, cursorPosition);
            updateMentionDropdown(query); // Оновлюємо список у залежності від введеного тексту
        } else {
            hideMentionDropdown(); // Ховаємо список, якщо не введено "@"
        }

        // Перевірка видалення згаданих юзерів
        const currentMentions = editorContent.match(/@\w+/g) || [];
        const removedUsers = selectedUsers.filter(
            (user) => !currentMentions.includes(user.name)
        );

        if (removedUsers.length > 0) {
            removedUsers.forEach((user) => {
                selectedUsers.splice(selectedUsers.indexOf(user), 1);
            });
            updateSelectedUsersAttribute();
            
        }
    });


    function showMentionDropdown() {
        const range = window.getSelection().getRangeAt(0).getBoundingClientRect();
        mentionDropdown.style.top = `${range.bottom + window.scrollY}px`;
        mentionDropdown.style.left = `${range.left + window.scrollX}px`;
        mentionDropdown.style.display = 'block';
    }

    function updateMentionDropdown(query) {
        // Отримуємо вже вибраних користувачів
        const selectedUserIds = getSelectedUsersFromEditor().map(user => user.id);

        // Якщо query порожній, показуємо всіх користувачів
        const matches = query === '' ? users : users.filter((user) =>
            user.name.toLowerCase().includes(query.toLowerCase())
        );

        mentionDropdown.innerHTML = matches
            .map(
                (user) =>
                    `<div class="mention-item ${selectedUserIds.includes(user.id) ? 'disabled' : ''}" data-id="${user.id}">
                <img src="${user.photo}" alt="${user.name}" class="mention-photo">
                <span class="mention-name ${selectedUserIds.includes(user.id) ? 'mention-selected' : ''}">${user.name}</span>
            </div>`
            )
            .join('');

        mentionDropdown.querySelectorAll('.mention-item').forEach((item) =>
            item.addEventListener('click', (e) => selectMention(e.currentTarget.getAttribute('data-id')))
        );

    }



    function selectMention(userId) {
        // Пошук користувача за ID (рядком)
        const user = users.find((u) => u.id === userId);
        if (!user) return;

        const currentPosition = editor.editor.getPosition();
        const start = mentionStartIndex;
        const end = currentPosition;

        editor.editor.setSelectedRange([start, end]);
        editor.editor.deleteInDirection('forward');
        editor.editor.insertString(user.name + ' ');

        // Оновлення списків
        selectedUsers.push(user);
        updateSelectedUsersAttribute();

        hideMentionDropdown();
        mentionStartIndex = -1;
    }


    function hideMentionDropdown() {
        mentionDropdown.style.display = 'none';
    }

    document.addEventListener('click', (event) => {
        const isClickInsideEditor = editor.contains(event.target);
        const isClickInsideDropdown = mentionDropdown.contains(event.target);

        if (!isClickInsideEditor && !isClickInsideDropdown) {
            hideMentionDropdown(); // Ховаємо список, якщо клік поза ним
        }
        
    	
    });
    



    
    
	
}

  
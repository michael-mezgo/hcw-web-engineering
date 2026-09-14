export default function comments() {
    initCommentToggle();
    initCommentForm();
}

function initCommentToggle() {
    // Show/hide comments toggle
    const showHideBtn = document.querySelector('.show-hide');
    const commentWrapper = document.querySelector('.comment-wrapper');

    commentWrapper.style.display = 'none';

    showHideBtn.addEventListener('click', () => {
        const showHideText = showHideBtn.textContent;
        if (showHideText === 'Show comment') {
            showHideBtn.textContent = 'Hide comments';
            commentWrapper.style.display = 'block';
        } else {
            showHideBtn.textContent = 'Show comments';
            commentWrapper.style.display = 'none';
        }
    });
}

function initCommentForm() {
    // Comment form stuff
    const form = document.querySelector('.comment-form');
    const nameField = document.querySelector('#name');
    const commentField = document.querySelector('#comment');
    const list = document.querySelector('.comment-container');

    nameField.addEventListener('input', () => nameField.setCustomValidity(''));
    commentField.addEventListener('input', () => commentField.setCustomValidity(''));

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameValue = nameField.value.trim();
        const commentValue = commentField.value.trim();

        nameField.setCustomValidity(nameValue ? '' : 'Please enter your name.');
        commentField.setCustomValidity(commentValue ? '' : 'Please enter a comment.');

        if (!form.reportValidity()) return;

        const listItem = document.createElement('li');
        const namePara = document.createElement('p');
        const commentPara = document.createElement('p');

        namePara.textContent = nameValue;
        commentPara.textContent = commentValue;

        list.appendChild(listItem);
        listItem.appendChild(namePara);
        listItem.appendChild(commentPara);

        nameField.value = '';
        commentField.value = '';
    });
}
document.addEventListener('DOMContentLoaded', function () {
    var expandables = document.querySelectorAll('.expandable');

    expandables.forEach(function (expandable) {
        var toggle = expandable.querySelector('.toggle');
        var card = expandable.querySelector('.card');

        toggle.addEventListener('click', function () {
            expandable.classList.toggle('open');
            card.style.maxHeight = card.style.maxHeight ? '' : '2000px'; // Toggle the max-height
        });
    });
});
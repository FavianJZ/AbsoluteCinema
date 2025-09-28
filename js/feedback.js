document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('feedbackForm');
    const inputs = {
        name: document.getElementById('name'),
        email: document.getElementById('email'),
        feedbackType: document.getElementById('feedbackType'),
        comments: document.getElementById('comments'),
        rating: document.querySelectorAll('input[name="rating"]')
    };

    const errors = {
        name: document.getElementById('nameError'),
        email: document.getElementById('emailError'),
        feedbackType: document.getElementById('feedbackTypeError'),
        rating: document.getElementById('ratingError'),
        comments: document.getElementById('commentsError')
    };

    const successMessage = document.getElementById('formSubmissionSuccess');

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validateForm() {
        let isValid = true;

        Object.keys(errors).forEach(key => {
            errors[key].textContent = '';
        });

        if (!inputs.name.value.trim()) {
            errors.name.textContent = 'Nama tidak boleh kosong.';
            isValid = false;
        }

        if (!inputs.email.value.trim()) {
            errors.email.textContent = 'Email tidak boleh kosong.';
            isValid = false;
        } else if (!isValidEmail(inputs.email.value.trim())) {
            errors.email.textContent = 'Format email tidak valid.';
            isValid = false;
        }

        if (!inputs.feedbackType.value) {
            errors.feedbackType.textContent = 'Jenis umpan balik harus dipilih.';
            isValid = false;
        }

        let ratingSelected = false;
        inputs.rating.forEach(radio => {
            if (radio.checked) ratingSelected = true;
        });
        
        if (!ratingSelected) {
            errors.rating.textContent = 'Penilaian harus dipilih.';
            isValid = false;
        }

        if (!inputs.comments.value.trim()) {
            errors.comments.textContent = 'Komentar atau saran tidak boleh kosong.';
            isValid = false;
        }

        return isValid;
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        successMessage.style.display = 'none';

        if (validateForm()) {
            successMessage.textContent = 'Terima kasih! Umpan balik Anda telah berhasil dikirim.';
            successMessage.style.display = 'block';
            form.reset();
        }
    });
});
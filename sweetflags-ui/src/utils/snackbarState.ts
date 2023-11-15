import { ref } from 'vue';

export const snackbarState = {
    isVisible: ref(false),
    text: ref(''),
    showSnackbar: function(message: string) {
        this.text.value = message;
        this.isVisible.value = true;
    },
    closeSnackbar: function() {
        this.isVisible.value = false;
    }
};

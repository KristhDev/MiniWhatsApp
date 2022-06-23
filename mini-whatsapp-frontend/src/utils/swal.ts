import swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const mySwal = withReactContent(swal);

const wassSwal = mySwal.mixin({
    buttonsStyling: false,
    customClass: {
        closeButton: 'btn-alert btn-alert-cancel',
        cancelButton: 'btn-alert btn-alert-cancel',
        denyButton: 'btn-alert btn-alert-confirm',
        confirmButton: 'btn-alert btn-alert-confirm',
        popup: 'wass-alert',
        title: 'wass-alert-text wass-alert-title',
        htmlContainer: 'wass-alert-text',
        actions: 'wass-alert-actions',
    }
});

export default wassSwal;
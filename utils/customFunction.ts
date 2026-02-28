import { toast } from 'sonner';

export function showSuccessAlert(title: string, message: string) {
    toast.success(title, {
        description: message,
    });
}

export function showErrorAlert(title: string, message: string) {
    toast.error(title, {
        description: message,
    });
}

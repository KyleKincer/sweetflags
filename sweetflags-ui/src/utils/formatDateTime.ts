export default function formatDateTime(date: string) {
    if (date) {
        return new Intl.DateTimeFormat(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        }).format(new Date(date));
    }
    return '';
}
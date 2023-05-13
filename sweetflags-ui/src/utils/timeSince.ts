import { formatDistanceToNow } from 'date-fns';

export default function timeSince(date: Date) {
    return formatDistanceToNow(date, { addSuffix: true });
}
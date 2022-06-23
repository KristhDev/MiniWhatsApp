import './chat-date.scss';

interface ChatDateProps {
    date: string;
}

export const ChatDate = ({ date }: ChatDateProps) => {
    return (
        <div className="chat-date">
            <p>{ date }</p>
        </div>
    );
}
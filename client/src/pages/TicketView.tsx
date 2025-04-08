import TicketDetails from "@/components/tickets/TicketDetails";

interface TicketViewProps {
  id: string;
}

export default function TicketView({ id }: TicketViewProps) {
  return (
    <div>
      <TicketDetails ticketId={id} />
    </div>
  );
}

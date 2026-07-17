import type { StorySceneId } from './story';
import { STORY_FIXTURE } from './story-fixture';

const STATIC_EVIDENCE: Record<StorySceneId, readonly string[]> = {
  service: ['Reserva confirmada', `${STORY_FIXTURE.customer} · ${STORY_FIXTURE.appointmentTime}`, `${STORY_FIXTURE.service} · ${STORY_FIXTURE.staff} · ${STORY_FIXTURE.venue}`],
  payment: ['TPV reconocido', 'Cuenta de cobro', 'Operación diaria seleccionada manualmente'],
  aftercare: [`Recibo ${STORY_FIXTURE.paymentReference} enviado`, 'Reseña disponible', 'Facturación disponible cuando la sucursal la configura'],
  operations: [`Venta ${STORY_FIXTURE.paymentReference} registrada`, 'Inventario −1', 'Reorden sugerido', 'CRM y lealtad actualizado', 'Comisión de equipo registrada'],
  finance: [`Pago ${STORY_FIXTURE.paymentReference}`, 'Costo calculado', 'Liquidación esperada', 'Conciliación ligada', 'Póliza Premium'],
  multibranch: [`${STORY_FIXTURE.organization} → Sucursal Norte`, `Ticket ${STORY_FIXTURE.comparisonVenueTicket} · ${STORY_FIXTURE.comparisonVenueTicketChange}`],
  ai: [`Contexto ${STORY_FIXTURE.paymentReference}`, 'Pregunta sobre ticket y reorden', `Sucursal Norte · ${STORY_FIXTURE.comparisonVenueTicket} · ${STORY_FIXTURE.comparisonVenueTicketChange}`, `${STORY_FIXTURE.product} · ${STORY_FIXTURE.stockAfter} piezas · reorden sugerido`],
};

export default function StoryStaticEvidence({ sceneId }: { sceneId: StorySceneId }) {
  return (
    <ul data-story-static-evidence className="mt-7 grid gap-2 text-sm sm:grid-cols-2">
      {STATIC_EVIDENCE[sceneId].map(item => (
        <li key={item} className="rounded-xl border border-neutral-500/20 px-4 py-3">
          {item}
        </li>
      ))}
    </ul>
  );
}

import { Link, useSearchParams } from 'react-router-dom'
import './pagoEstado.css'

const PagoPendiente = () => {
  const [searchParams] = useSearchParams()
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id') || ''
  const externalReference = searchParams.get('external_reference') || ''
  const status = searchParams.get('status') || 'pending'

  return (
    <main className="payment-status-page">
      <section className="payment-status-card payment-status-pending">
        <span className="payment-status-badge">Pago {status}</span>
        <h1>Estamos esperando la confirmación</h1>
        <p>
          El pago todavía no quedó aprobado o rechazado. Cuando Mercado Pago
          actualice el estado, el pedido quedará resuelto.
        </p>

        {(paymentId || externalReference) && (
          <div className="payment-status-details">
            <strong>Datos de la transacción</strong>
            {paymentId && <span>Pago: {paymentId}</span>}
            {externalReference && <span>Referencia externa: {externalReference}</span>}
          </div>
        )}

        <div className="payment-status-details">
          <strong>Mientras tanto</strong>
          <span>Puedes volver al inicio o revisar el catálogo sin perder el seguimiento del proceso.</span>
        </div>

        <div className="payment-status-actions">
          <Link className="payment-status-link primary" to="/">
            Volver al inicio
          </Link>
          <Link className="payment-status-link secondary" to="/productos">
            Seguir viendo productos
          </Link>
        </div>
      </section>
    </main>
  )
}

export default PagoPendiente
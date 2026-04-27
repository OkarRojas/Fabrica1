import { Link, useSearchParams } from 'react-router-dom'
import './pagoEstado.css'

const PagoFallido = () => {
  const [searchParams] = useSearchParams()
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id') || ''
  const externalReference = searchParams.get('external_reference') || ''
  const status = searchParams.get('status') || 'failure'

  return (
    <main className="payment-status-page">
      <section className="payment-status-card payment-status-failure">
        <span className="payment-status-badge">Pago {status === 'rejected' ? 'rechazado' : 'fallido'}</span>
        <h1>No se pudo completar el pago</h1>
        <p>
          Mercado Pago no confirmó la operación. Puedes intentar nuevamente desde
          el checkout o regresar al catálogo para ajustar tu compra.
        </p>

        {(paymentId || externalReference) && (
          <div className="payment-status-details">
            <strong>Datos de la transacción</strong>
            {paymentId && <span>Pago: {paymentId}</span>}
            {externalReference && <span>Referencia externa: {externalReference}</span>}
          </div>
        )}

        <div className="payment-status-details">
          <strong>Sugerencia</strong>
          <span>Verifica tus datos, el medio de pago o vuelve a iniciar el proceso cuando quieras.</span>
        </div>

        <div className="payment-status-actions">
          <Link className="payment-status-link primary" to="/checkout">
            Volver al checkout
          </Link>
          <Link className="payment-status-link secondary" to="/productos">
            Ir a productos
          </Link>
        </div>
      </section>
    </main>
  )
}

export default PagoFallido
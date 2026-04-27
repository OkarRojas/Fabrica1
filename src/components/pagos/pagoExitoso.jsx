import { Link, useSearchParams } from 'react-router-dom'
import './pagoEstado.css'

const PagoExitoso = () => {
  const [searchParams] = useSearchParams()
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id') || ''
  const preferenceId = searchParams.get('preference_id') || ''
  const externalReference = searchParams.get('external_reference') || ''
  const status = searchParams.get('status') || 'success'

  return (
    <main className="payment-status-page">
      <section className="payment-status-card payment-status-success">
        <span className="payment-status-badge">Pago {status === 'approved' ? 'aprobado' : 'confirmado'}</span>
        <h1>Tu compra fue confirmada</h1>
        <p>
          Recibimos la aprobación de Mercado Pago. Tu pedido quedó registrado y
          pronto comenzaremos a prepararlo.
        </p>

        {(paymentId || preferenceId || externalReference) && (
          <div className="payment-status-details">
            <strong>Datos de la transacción</strong>
            {paymentId && <span>Pago: {paymentId}</span>}
            {preferenceId && <span>Preferencia: {preferenceId}</span>}
            {externalReference && <span>Referencia externa: {externalReference}</span>}
          </div>
        )}

        <div className="payment-status-details">
          <strong>Que sigue ahora</strong>
          <span>Revisa el estado de tu pedido desde la sección de pedidos o vuelve al inicio para seguir navegando.</span>
        </div>

        <div className="payment-status-actions">
          <Link className="payment-status-link primary" to="/">
            Volver al inicio
          </Link>
          <Link className="payment-status-link secondary" to="/productos">
            Seguir comprando
          </Link>
        </div>
      </section>
    </main>
  )
}

export default PagoExitoso
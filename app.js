<script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { 
        getFirestore, 
        collection, 
        addDoc, 
        onSnapshot, 
        query, 
        orderBy, 
        doc, 
        deleteDoc 
    } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

    // Mantené tus credenciales
    const firebaseConfig = { /* TUS DATOS */ };

    try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const finanzasRef = collection(db, "finanzas");

        const inputMonto = document.getElementById('monto');
        const formatear = (v) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(v);

        // Máscara de puntos
        inputMonto.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/\D/g, "");
            if (valor !== "") e.target.value = new Intl.NumberFormat('es-AR').format(parseInt(valor));
        });

        // --- FUNCIÓN ELIMINAR ---
        window.eliminarMovimiento = async (id) => {
            if (confirm("¿Estás seguro de que querés eliminar este registro?")) {
                try {
                    await deleteDoc(doc(db, "finanzas", id));
                } catch (error) {
                    console.error("Error al eliminar:", error);
                }
            }
        };

        const guardar = async (tipo) => {
            const d = document.getElementById('descripcion').value;
            const mRaw = inputMonto.value.replace(/\./g, ""); 
            const m = parseFloat(mRaw);
            
            if (!d || isNaN(m)) {
                alert("Completá los datos");
                return;
            }

            await addDoc(finanzasRef, { descripcion: d, monto: m, tipo: tipo, fecha: Date.now() });
            document.getElementById('descripcion').value = "";
            inputMonto.value = "";
        };

        document.getElementById('btn-ingreso').onclick = () => guardar('ingreso');
        document.getElementById('btn-gasto').onclick = () => guardar('gasto');

        // Escucha en tiempo real con botón de eliminar
        onSnapshot(query(finanzasRef, orderBy("fecha", "desc")), (snap) => {
            let ing = 0, gas = 0, html = "";
            snap.forEach(documento => {
                const i = documento.data();
                const id = documento.id; // Obtenemos el ID único de Firebase
                
                if (i.tipo === "ingreso") ing += i.monto; else gas += i.monto;
                
                html += `
    <li>
        <div style="display:flex; flex-direction:column">
            <span style="font-weight: 600; font-size: 1.1rem;">${i.descripcion}</span>
            <small style="color:#94a3b8; font-size:0.8rem">Hoy</small> 
        </div>
        <div style="display:flex; align-items:center; gap:15px">
            <b class="${i.tipo === 'ingreso' ? 'positivo' : 'negativo'}" style="font-size: 1.2rem">
                ${i.tipo === 'ingreso' ? '+' : '-'}${formatear(i.monto)}
            </b>
            <button class="btn-eliminar" onclick="eliminarDato('${id}')">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
        </div>
    </li>`;
            });
            
            document.getElementById('lista-movimientos').innerHTML = html;
            document.getElementById('total-ingresos').innerText = formatear(ing);
            document.getElementById('total-gastos').innerText = formatear(gas);
            const neto = ing - gas;
            const s = document.getElementById('saldo-total');
            s.innerText = formatear(neto);
            s.className = neto >= 0 ? "positivo" : "negativo";
        });

    } catch (error) {
        console.error("Error:", error);
    }
</script>
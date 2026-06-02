let empleados = [
  { id: 1, nombre: 'Ana Garcia',     cargo: 'Desarrolladora Senior',  depto: 'TI',          correo: 'ana.garcia@empresa.com',      telefono: '+56 9 1111 2222', estado: 'Activo',   salario: 2800000, fechaIngreso: '2021-03-15' },
  { id: 2, nombre: 'Carlos Lopez',   cargo: 'Analista Financiero',    depto: 'Finanzas',    correo: 'carlos.lopez@empresa.com',    telefono: '+56 9 2222 3333', estado: 'Activo',   salario: 2200000, fechaIngreso: '2020-07-01' },
  { id: 3, nombre: 'Maria Torres',   cargo: 'Ejecutiva de Ventas',    depto: 'Ventas',      correo: 'maria.torres@empresa.com',    telefono: '+56 9 3333 4444', estado: 'Activo',   salario: 1900000, fechaIngreso: '2022-01-10' },
  { id: 4, nombre: 'Jose Martinez',  cargo: 'Jefe de Operaciones',    depto: 'Operaciones', correo: 'jose.martinez@empresa.com',   telefono: '+56 9 4444 5555', estado: 'Activo',   salario: 3100000, fechaIngreso: '2019-05-20' },
  { id: 5, nombre: 'Laura Jimenez',  cargo: 'Disenadora UX',          depto: 'Marketing',   correo: 'laura.jimenez@empresa.com',   telefono: '+56 9 5555 6666', estado: 'Activo',   salario: 2100000, fechaIngreso: '2023-02-14' },
  { id: 6, nombre: 'Pedro Rodriguez',cargo: 'DevOps Engineer',         depto: 'TI',          correo: 'pedro.rodriguez@empresa.com', telefono: '+56 9 6666 7777', estado: 'Inactivo', salario: 2600000, fechaIngreso: '2020-11-30' },
  { id: 7, nombre: 'Sofia Ramirez',  cargo: 'Contadora',              depto: 'Finanzas',    correo: 'sofia.ramirez@empresa.com',   telefono: '+56 9 7777 8888', estado: 'Activo',   salario: 2000000, fechaIngreso: '2021-08-22' },
  { id: 8, nombre: 'Diego Morales',  cargo: 'Analista de Marketing',  depto: 'Marketing',   correo: 'diego.morales@empresa.com',   telefono: '+56 9 8888 9999', estado: 'Activo',   salario: 1850000, fechaIngreso: '2022-06-05' },
];

let solicitudes = [
  { id: 1, empId: 3, tipo: 'Vacaciones', fechaInicio: '2026-06-10', fechaFin: '2026-06-20', estado: 'Pendiente', obs: 'Vacaciones anuales' },
  { id: 2, empId: 5, tipo: 'Medico',     fechaInicio: '2026-06-03', fechaFin: '2026-06-03', estado: 'Aprobada',  obs: 'Control medico' },
  { id: 3, empId: 1, tipo: 'Permiso',    fechaInicio: '2026-06-15', fechaFin: '2026-06-15', estado: 'Pendiente', obs: 'Tramite personal' },
  { id: 4, empId: 7, tipo: 'Vacaciones', fechaInicio: '2026-07-01', fechaFin: '2026-07-14', estado: 'Pendiente', obs: 'Vacaciones anuales' },
  { id: 5, empId: 2, tipo: 'Permiso',    fechaInicio: '2026-05-28', fechaFin: '2026-05-28', estado: 'Rechazada', obs: '' },
];

let asistencia = [];
let nextEmpId = 9;
let nextSolId = 6;
let editingEmpId = null;

function generateAsistencia() {
  const today = new Date();
  empleados.filter(e => e.estado === 'Activo').forEach(emp => {
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - d);
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      const h1 = 7 + Math.floor(Math.random() * 2);
      const h2 = 17 + Math.floor(Math.random() * 2);
      const m = Math.random() > .5 ? '00' : '30';
      const estados = ['Presente', 'Presente', 'Presente', 'Tardanza', 'Presente'];
      asistencia.push({
        empId: emp.id,
        fecha: date.toISOString().split('T')[0],
        entrada: `0${h1}:${m}`,
        salida: `${h2}:${m}`,
        estado: estados[Math.floor(Math.random() * estados.length)]
      });
    }
  });
}

function formatCLP(n) { return '$' + Number(n).toLocaleString('es-CL'); }
function diffDays(a, b) { return Math.max(1, Math.ceil((new Date(b) - new Date(a)) / 86400000) + 1); }
function getEmpleado(id) { return empleados.find(e => e.id === id); }
function initials(name) { return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase(); }

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + type + ' show';
  setTimeout(() => { t.className = 'toast'; }, 3000);
}

function estadoBadge(e) {
  const map = { Activo: 'badge-success', Inactivo: 'badge-gray', Presente: 'badge-success', Tardanza: 'badge-warning', Ausente: 'badge-danger', Pendiente: 'badge-warning', Aprobada: 'badge-success', Rechazada: 'badge-danger' };
  return '<span class="badge ' + (map[e] || 'badge-gray') + '">' + e + '</span>';
}

function navigate(section) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('section-' + section).classList.add('active');
  document.querySelector('[data-section="' + section + '"]').classList.add('active');
  const titles = { dashboard: 'Dashboard', empleados: 'Empleados', asistencia: 'Asistencia', solicitudes: 'Solicitudes', nomina: 'Nomina' };
  document.getElementById('pageTitle').textContent = titles[section] || section;
  const topBtn = document.getElementById('topActionBtn');
  const topActions = { dashboard: '+ Nuevo Empleado', empleados: '+ Agregar Empleado', asistencia: '', solicitudes: '+ Nueva Solicitud', nomina: '' };
  topBtn.textContent = topActions[section] || '';
  topBtn.style.display = topActions[section] ? '' : 'none';
  topBtn.dataset.action = section;
  if (section === 'asistencia') renderAsistencia();
  if (section === 'nomina') renderNomina();
  if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open');
}

function renderDashboard() {
  const activos = empleados.filter(e => e.estado === 'Activo').length;
  const hoy = new Date().toISOString().split('T')[0];
  const presentes = asistencia.filter(a => a.fecha === hoy && a.estado !== 'Ausente').length;
  const pendientes = solicitudes.filter(s => s.estado === 'Pendiente').length;
  const ausentes = solicitudes.filter(s => s.estado === 'Aprobada' && s.fechaInicio <= hoy && s.fechaFin >= hoy).length;
  document.getElementById('totalEmpleados').textContent = activos;
  document.getElementById('presentesHoy').textContent = presentes || activos - ausentes;
  document.getElementById('solicitudesPendientes').textContent = pendientes;
  document.getElementById('ausentes').textContent = ausentes;
  document.getElementById('recentTableBody').innerHTML = empleados.slice(-5).reverse().map(e =>
    '<tr><td><strong>' + e.nombre + '</strong></td><td>' + e.cargo + '</td><td>' + e.depto + '</td><td>' + estadoBadge(e.estado) + '</td></tr>'
  ).join('');
  document.getElementById('recentRequests').innerHTML = solicitudes.slice(-5).reverse().map(s => {
    const emp = getEmpleado(s.empId);
    return '<div class="request-item"><div class="request-avatar">' + initials(emp.nombre) + '</div><div style="flex:1"><div class="request-name">' + emp.nombre + '</div><div class="request-type">' + s.tipo + ' - ' + s.fechaInicio + '</div></div>' + estadoBadge(s.estado) + '</div>';
  }).join('');
}

function renderEmpleados(filter, depto) {
  filter = filter || ''; depto = depto || '';
  let data = empleados;
  if (filter) data = data.filter(e => e.nombre.toLowerCase().includes(filter.toLowerCase()) || e.cargo.toLowerCase().includes(filter.toLowerCase()) || e.correo.toLowerCase().includes(filter.toLowerCase()));
  if (depto) data = data.filter(e => e.depto === depto);
  const tbody = document.getElementById('empleadosTableBody');
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon">&#128100;</div><p>No se encontraron empleados</p></div></td></tr>';
    return;
  }
  tbody.innerHTML = data.map(e =>
    '<tr>' +
    '<td><code style="background:var(--gray-100);padding:.2rem .5rem;border-radius:4px;font-size:.75rem">#' + e.id + '</code></td>' +
    '<td><strong>' + e.nombre + '</strong></td>' +
    '<td>' + e.cargo + '</td>' +
    '<td><span class="badge badge-info" style="font-size:.72rem">' + e.depto + '</span></td>' +
    '<td style="color:var(--gray-500)">' + e.correo + '</td>' +
    '<td>' + estadoBadge(e.estado) + '</td>' +
    '<td><button class="action-btn edit" title="Editar" onclick="openEditEmpleado(' + e.id + ')">&#9998;</button> <button class="action-btn delete" title="Eliminar" onclick="deleteEmpleado(' + e.id + ')">&#128465;</button></td>' +
    '</tr>'
  ).join('');
}

function openAddEmpleado() {
  editingEmpId = null;
  document.getElementById('modalEmpleadoTitle').textContent = 'Nuevo Empleado';
  document.getElementById('formEmpleado').reset();
  document.getElementById('empFecha').value = new Date().toISOString().split('T')[0];
  document.getElementById('modalEmpleado').classList.add('open');
}

function openEditEmpleado(id) {
  editingEmpId = id;
  const e = getEmpleado(id);
  document.getElementById('modalEmpleadoTitle').textContent = 'Editar Empleado';
  document.getElementById('empNombre').value = e.nombre;
  document.getElementById('empCorreo').value = e.correo;
  document.getElementById('empCargo').value = e.cargo;
  document.getElementById('empDepto').value = e.depto;
  document.getElementById('empFecha').value = e.fechaIngreso;
  document.getElementById('empSalario').value = e.salario;
  document.getElementById('empEstado').value = e.estado;
  document.getElementById('empTelefono').value = e.telefono;
  document.getElementById('modalEmpleado').classList.add('open');
}

function deleteEmpleado(id) {
  if (!confirm('Eliminar este empleado?')) return;
  empleados = empleados.filter(e => e.id !== id);
  renderEmpleados();
  renderDashboard();
  showToast('Empleado eliminado', 'error');
}

function renderAsistencia() {
  const fecha = document.getElementById('fechaAsistencia').value || new Date().toISOString().split('T')[0];
  const depto = document.getElementById('filterDeptoAsist').value;
  const tbody = document.getElementById('asistenciaTableBody');
  let data = asistencia.filter(a => a.fecha === fecha);
  if (depto) data = data.filter(a => { const emp = getEmpleado(a.empId); return emp && emp.depto === depto; });
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">&#128197;</div><p>Sin registros para esta fecha</p></div></td></tr>';
    return;
  }
  tbody.innerHTML = data.map(a => {
    const emp = getEmpleado(a.empId);
    if (!emp) return '';
    const parts1 = a.entrada.split(':').map(Number);
    const parts2 = a.salida.split(':').map(Number);
    const horas = ((parts2[0] * 60 + parts2[1]) - (parts1[0] * 60 + parts1[1])) / 60;
    return '<tr><td><strong>' + emp.nombre + '</strong></td><td><span class="badge badge-info" style="font-size:.72rem">' + emp.depto + '</span></td><td>' + a.entrada + '</td><td>' + a.salida + '</td><td>' + horas.toFixed(1) + 'h</td><td>' + estadoBadge(a.estado) + '</td></tr>';
  }).join('');
}

function renderSolicitudes() {
  const tipo = document.getElementById('filterTipoSol').value;
  const estado = document.getElementById('filterEstadoSol').value;
  const tbody = document.getElementById('solicitudesTableBody');
  let data = solicitudes.slice();
  if (tipo) data = data.filter(s => s.tipo === tipo);
  if (estado) data = data.filter(s => s.estado === estado);
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon">&#128196;</div><p>No hay solicitudes</p></div></td></tr>';
    return;
  }
  tbody.innerHTML = data.map(s => {
    const emp = getEmpleado(s.empId);
    const dias = diffDays(s.fechaInicio, s.fechaFin);
    const acciones = (s.estado === 'Pendiente' ? '<button class="action-btn approve" title="Aprobar" onclick="updateSolicitud(' + s.id + ',\'Aprobada\')">&#10003;</button> <button class="action-btn reject" title="Rechazar" onclick="updateSolicitud(' + s.id + ',\'Rechazada\')">&#10005;</button> ' : '') +
      '<button class="action-btn delete" title="Eliminar" onclick="deleteSolicitud(' + s.id + ')">&#128465;</button>';
    return '<tr><td><strong>' + emp.nombre + '</strong></td><td>' + s.tipo + '</td><td>' + s.fechaInicio + '</td><td>' + s.fechaFin + '</td><td>' + dias + ' dia' + (dias > 1 ? 's' : '') + '</td><td>' + estadoBadge(s.estado) + '</td><td>' + acciones + '</td></tr>';
  }).join('');
}

function updateSolicitud(id, estado) {
  const s = solicitudes.find(x => x.id === id);
  if (s) { s.estado = estado; renderSolicitudes(); renderDashboard(); showToast('Solicitud ' + estado.toLowerCase(), estado === 'Aprobada' ? 'success' : 'error'); }
}

function deleteSolicitud(id) {
  if (!confirm('Eliminar esta solicitud?')) return;
  solicitudes = solicitudes.filter(s => s.id !== id);
  renderSolicitudes(); renderDashboard();
  showToast('Solicitud eliminada', 'error');
}

function openAddSolicitud() {
  document.getElementById('formSolicitud').reset();
  document.getElementById('solEmpleado').innerHTML = empleados.filter(e => e.estado === 'Activo').map(e => '<option value="' + e.id + '">' + e.nombre + '</option>').join('');
  document.getElementById('modalSolicitud').classList.add('open');
}

function renderNomina() {
  let total = 0;
  const activos = empleados.filter(e => e.estado === 'Activo');
  document.getElementById('nominaTableBody').innerHTML = activos.map(e => {
    const bonos = Math.round(e.salario * 0.1);
    const deducciones = Math.round(e.salario * 0.135);
    const neto = e.salario + bonos - deducciones;
    total += neto;
    return '<tr><td><strong>' + e.nombre + '</strong></td><td>' + e.cargo + '</td><td>' + formatCLP(e.salario) + '</td><td style="color:var(--success)">' + formatCLP(bonos) + '</td><td style="color:var(--danger)">-' + formatCLP(deducciones) + '</td><td><strong>' + formatCLP(neto) + '</strong></td><td>' + estadoBadge('Aprobada') + '</td></tr>';
  }).join('');
  document.getElementById('totalNomina').textContent = formatCLP(total);
  document.getElementById('promedioSalario').textContent = activos.length ? formatCLP(Math.round(total / activos.length)) : '$0';
}

function exportCSV() {
  const fecha = document.getElementById('fechaAsistencia').value || new Date().toISOString().split('T')[0];
  const data = asistencia.filter(a => a.fecha === fecha);
  const rows = [['Empleado', 'Departamento', 'Entrada', 'Salida', 'Estado']];
  data.forEach(a => { const emp = getEmpleado(a.empId); if (emp) rows.push([emp.nombre, emp.depto, a.entrada, a.salida, a.estado]); });
  const csv = rows.map(r => r.map(c => '"' + c + '"').join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'asistencia_' + fecha + '.csv'; a.click();
  URL.revokeObjectURL(url);
  showToast('CSV exportado correctamente');
}

document.addEventListener('DOMContentLoaded', function() {
  generateAsistencia();
  const now = new Date();
  document.getElementById('dateDisplay').textContent = now.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('fechaAsistencia').value = now.toISOString().split('T')[0];
  renderDashboard();
  renderEmpleados();
  renderSolicitudes();

  document.querySelectorAll('.nav-item').forEach(function(item) {
    item.addEventListener('click', function(e) { e.preventDefault(); navigate(item.dataset.section); });
  });
  document.getElementById('topActionBtn').addEventListener('click', function() {
    const section = document.getElementById('topActionBtn').dataset.action;
    if (section === 'empleados' || section === 'dashboard') openAddEmpleado();
    if (section === 'solicitudes') openAddSolicitud();
  });
  document.getElementById('menuBtn').addEventListener('click', function() { document.getElementById('sidebar').classList.toggle('open'); });
  document.getElementById('sidebarToggle').addEventListener('click', function() { document.getElementById('sidebar').classList.remove('open'); });
  document.getElementById('searchEmpleados').addEventListener('input', function() { renderEmpleados(this.value, document.getElementById('filterDepto').value); });
  document.getElementById('filterDepto').addEventListener('change', function() { renderEmpleados(document.getElementById('searchEmpleados').value, this.value); });
  document.getElementById('addEmpleadoBtn').addEventListener('click', openAddEmpleado);
  document.getElementById('fechaAsistencia').addEventListener('change', renderAsistencia);
  document.getElementById('filterDeptoAsist').addEventListener('change', renderAsistencia);
  document.getElementById('exportAsistBtn').addEventListener('click', exportCSV);
  document.getElementById('filterTipoSol').addEventListener('change', renderSolicitudes);
  document.getElementById('filterEstadoSol').addEventListener('change', renderSolicitudes);
  document.getElementById('addSolicitudBtn').addEventListener('click', openAddSolicitud);
  document.getElementById('filterMesNomina').addEventListener('change', renderNomina);
  document.getElementById('filterAnioNomina').addEventListener('change', renderNomina);
  document.getElementById('exportNominaBtn').addEventListener('click', function() { showToast('Funcionalidad PDF proximamente'); });

  document.getElementById('closeModalEmpleado').addEventListener('click', function() { document.getElementById('modalEmpleado').classList.remove('open'); });
  document.getElementById('cancelModalEmpleado').addEventListener('click', function() { document.getElementById('modalEmpleado').classList.remove('open'); });
  document.getElementById('modalEmpleado').addEventListener('click', function(e) { if (e.target === this) this.classList.remove('open'); });
  document.getElementById('formEmpleado').addEventListener('submit', function(e) {
    e.preventDefault();
    const emp = {
      nombre: document.getElementById('empNombre').value.trim(),
      correo: document.getElementById('empCorreo').value.trim(),
      cargo: document.getElementById('empCargo').value.trim(),
      depto: document.getElementById('empDepto').value,
      fechaIngreso: document.getElementById('empFecha').value,
      salario: parseInt(document.getElementById('empSalario').value),
      estado: document.getElementById('empEstado').value,
      telefono: document.getElementById('empTelefono').value.trim(),
    };
    if (editingEmpId) {
      const idx = empleados.findIndex(x => x.id === editingEmpId);
      empleados[idx] = Object.assign({}, empleados[idx], emp);
      showToast('Empleado actualizado');
    } else {
      empleados.push(Object.assign({ id: nextEmpId++ }, emp));
      showToast('Empleado agregado exitosamente');
    }
    document.getElementById('modalEmpleado').classList.remove('open');
    renderEmpleados(); renderDashboard();
  });

  document.getElementById('closeModalSolicitud').addEventListener('click', function() { document.getElementById('modalSolicitud').classList.remove('open'); });
  document.getElementById('cancelModalSolicitud').addEventListener('click', function() { document.getElementById('modalSolicitud').classList.remove('open'); });
  document.getElementById('modalSolicitud').addEventListener('click', function(e) { if (e.target === this) this.classList.remove('open'); });
  document.getElementById('formSolicitud').addEventListener('submit', function(e) {
    e.preventDefault();
    solicitudes.push({
      id: nextSolId++,
      empId: parseInt(document.getElementById('solEmpleado').value),
      tipo: document.getElementById('solTipo').value,
      fechaInicio: document.getElementById('solFechaInicio').value,
      fechaFin: document.getElementById('solFechaFin').value,
      estado: document.getElementById('solEstado').value,
      obs: document.getElementById('solObservaciones').value.trim(),
    });
    document.getElementById('modalSolicitud').classList.remove('open');
    renderSolicitudes(); renderDashboard();
    showToast('Solicitud creada exitosamente');
  });
});
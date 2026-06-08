let usuarios = JSON.parse(localStorage.getItem('rrhh_usuarios') || 'null') || [
  { id: 1, username: 'admin',     nombre: 'Administrador',    correo: 'admin@empresa.com',     password: 'admin123', rol: 'Administrador', estado: 'Activo', ultimoAcceso: new Date().toISOString() },
  { id: 2, username: 'rrhh',      nombre: 'Gestor RRHH',      correo: 'rrhh@empresa.com',      password: 'rrhh123',  rol: 'RRHH',          estado: 'Activo', ultimoAcceso: null },
  { id: 3, username: 'supervisor',nombre: 'Supervisor Area',  correo: 'supervisor@empresa.com',password: 'super123', rol: 'Supervisor',    estado: 'Activo', ultimoAcceso: null },
];
let currentUser = null;
let nextUsrId = 4;
function saveUsuarios() { localStorage.setItem('rrhh_usuarios', JSON.stringify(usuarios)); }

let empleados = JSON.parse(localStorage.getItem('rrhh_empleados') || 'null') || [
  { id: 1, nombre: 'Ana Garcia',      cargo: 'Desarrolladora Senior',  depto: 'TI',          correo: 'ana.garcia@empresa.com',      telefono: '+56 9 1111 2222', estado: 'Activo',   salario: 2800000, fechaIngreso: '2021-03-15', contrato: 'Indefinido', obs: '' },
  { id: 2, nombre: 'Carlos Lopez',    cargo: 'Analista Financiero',    depto: 'Finanzas',    correo: 'carlos.lopez@empresa.com',    telefono: '+56 9 2222 3333', estado: 'Activo',   salario: 2200000, fechaIngreso: '2020-07-01', contrato: 'Indefinido', obs: '' },
  { id: 3, nombre: 'Maria Torres',    cargo: 'Ejecutiva de Ventas',    depto: 'Ventas',      correo: 'maria.torres@empresa.com',    telefono: '+56 9 3333 4444', estado: 'Activo',   salario: 1900000, fechaIngreso: '2022-01-10', contrato: 'Plazo Fijo', obs: '' },
  { id: 4, nombre: 'Jose Martinez',   cargo: 'Jefe de Operaciones',    depto: 'Operaciones', correo: 'jose.martinez@empresa.com',   telefono: '+56 9 4444 5555', estado: 'Activo',   salario: 3100000, fechaIngreso: '2019-05-20', contrato: 'Indefinido', obs: '' },
  { id: 5, nombre: 'Laura Jimenez',   cargo: 'Disenadora UX',          depto: 'Marketing',   correo: 'laura.jimenez@empresa.com',   telefono: '+56 9 5555 6666', estado: 'Activo',   salario: 2100000, fechaIngreso: '2023-02-14', contrato: 'Indefinido', obs: '' },
  { id: 6, nombre: 'Pedro Rodriguez', cargo: 'DevOps Engineer',         depto: 'TI',          correo: 'pedro.rodriguez@empresa.com', telefono: '+56 9 6666 7777', estado: 'Inactivo', salario: 2600000, fechaIngreso: '2020-11-30', contrato: 'Indefinido', obs: '' },
  { id: 7, nombre: 'Sofia Ramirez',   cargo: 'Contadora',              depto: 'Finanzas',    correo: 'sofia.ramirez@empresa.com',   telefono: '+56 9 7777 8888', estado: 'Activo',   salario: 2000000, fechaIngreso: '2021-08-22', contrato: 'Indefinido', obs: '' },
  { id: 8, nombre: 'Diego Morales',   cargo: 'Analista de Marketing',  depto: 'Marketing',   correo: 'diego.morales@empresa.com',   telefono: '+56 9 8888 9999', estado: 'Activo',   salario: 1850000, fechaIngreso: '2022-06-05', contrato: 'Plazo Fijo', obs: '' },
];
let solicitudes = JSON.parse(localStorage.getItem('rrhh_solicitudes') || 'null') || [
  { id: 1, empId: 3, tipo: 'Vacaciones', fechaInicio: '2026-06-10', fechaFin: '2026-06-20', estado: 'Pendiente', obs: 'Vacaciones anuales' },
  { id: 2, empId: 5, tipo: 'Medico',     fechaInicio: '2026-06-03', fechaFin: '2026-06-03', estado: 'Aprobada',  obs: 'Control medico' },
  { id: 3, empId: 1, tipo: 'Permiso',    fechaInicio: '2026-06-15', fechaFin: '2026-06-15', estado: 'Pendiente', obs: 'Tramite personal' },
  { id: 4, empId: 7, tipo: 'Vacaciones', fechaInicio: '2026-07-01', fechaFin: '2026-07-14', estado: 'Pendiente', obs: 'Vacaciones anuales' },
  { id: 5, empId: 2, tipo: 'Permiso',    fechaInicio: '2026-05-28', fechaFin: '2026-05-28', estado: 'Rechazada', obs: '' },
];
let asistencia = [];
let nextEmpId = 9, nextSolId = 6, editingEmpId = null, editingUsrId = null;
function saveEmpleados() { localStorage.setItem('rrhh_empleados', JSON.stringify(empleados)); }
function saveSolicitudes() { localStorage.setItem('rrhh_solicitudes', JSON.stringify(solicitudes)); }

function formatCLP(n) { return '$' + Number(n).toLocaleString('es-CL'); }
function diffDays(a, b) { return Math.max(1, Math.ceil((new Date(b) - new Date(a)) / 86400000) + 1); }
function getEmpleado(id) { return empleados.find(function(e) { return e.id === id; }); }
function initials(name) { return name.split(' ').slice(0, 2).map(function(w) { return w[0]; }).join('').toUpperCase(); }
function showToast(msg, type) {
  type = type || 'success';
  var t = document.getElementById('toast');
  t.textContent = msg; t.className = 'toast ' + type + ' show';
  setTimeout(function() { t.className = 'toast'; }, 3000);
}
function estadoBadge(e) {
  var map = { Activo:'badge-success', Inactivo:'badge-gray', Presente:'badge-success', Tardanza:'badge-warning', Ausente:'badge-danger', Pendiente:'badge-warning', Aprobada:'badge-success', Rechazada:'badge-danger', Administrador:'badge-purple', RRHH:'badge-info', Supervisor:'badge-orange' };
  return '<span class="badge ' + (map[e] || 'badge-gray') + '">' + e + '</span>';
}

function generateAsistencia() {
  var today = new Date();
  empleados.filter(function(e) { return e.estado === 'Activo'; }).forEach(function(emp) {
    for (var d = 0; d < 7; d++) {
      var date = new Date(today); date.setDate(today.getDate() - d);
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      var h1 = 7 + Math.floor(Math.random() * 2), h2 = 17 + Math.floor(Math.random() * 2);
      var m = Math.random() > .5 ? '00' : '30';
      var estados = ['Presente','Presente','Presente','Tardanza','Presente'];
      asistencia.push({ empId: emp.id, fecha: date.toISOString().split('T')[0], entrada: '0' + h1 + ':' + m, salida: h2 + ':' + m, estado: estados[Math.floor(Math.random() * estados.length)] });
    }
  });
}

function initLogin() {
  var overlay = document.getElementById('loginOverlay');
  document.getElementById('togglePass').addEventListener('click', function() {
    var i = document.getElementById('loginPass'); i.type = i.type === 'password' ? 'text' : 'password';
  });
  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var u = document.getElementById('loginUser').value.trim();
    var p = document.getElementById('loginPass').value;
    var found = usuarios.find(function(x) { return x.username === u && x.password === p && x.estado === 'Activo'; });
    var errEl = document.getElementById('loginError');
    if (!found) { errEl.textContent = 'Usuario o contrasena incorrectos'; errEl.classList.add('show'); return; }
    errEl.classList.remove('show');
    found.ultimoAcceso = new Date().toISOString(); saveUsuarios();
    currentUser = found;
    overlay.classList.add('hidden');
    document.getElementById('sidebarAvatar').textContent = initials(found.nombre);
    document.getElementById('sidebarUsername').textContent = found.nombre;
    document.getElementById('sidebarRole').textContent = found.rol;
    showToast('Bienvenido, ' + found.nombre.split(' ')[0]);
  });
}

function logout() {
  if (!confirm('Cerrar sesion?')) return;
  currentUser = null;
  document.getElementById('loginOverlay').classList.remove('hidden');
  document.getElementById('loginForm').reset();
}

function navigate(section) {
  document.querySelectorAll('.content-section').forEach(function(s) { s.classList.remove('active'); });
  document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
  document.getElementById('section-' + section).classList.add('active');
  document.querySelector('[data-section="' + section + '"]').classList.add('active');
  var titles = { dashboard:'Dashboard', empleados:'Empleados', asistencia:'Asistencia', solicitudes:'Solicitudes', nomina:'Nomina', usuarios:'Gestion de Usuarios' };
  document.getElementById('pageTitle').textContent = titles[section] || section;
  var topBtn = document.getElementById('topActionBtn');
  var topActions = { dashboard:'+ Nuevo Empleado', empleados:'+ Agregar Empleado', asistencia:'', solicitudes:'+ Nueva Solicitud', nomina:'', usuarios:'+ Crear Usuario' };
  topBtn.textContent = topActions[section] || ''; topBtn.style.display = topActions[section] ? '' : 'none'; topBtn.dataset.action = section;
  if (section === 'asistencia') renderAsistencia();
  if (section === 'nomina') renderNomina();
  if (section === 'usuarios') renderUsuarios();
  if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open');
}

function renderDashboard() {
  var activos = empleados.filter(function(e) { return e.estado === 'Activo'; }).length;
  var hoy = new Date().toISOString().split('T')[0];
  var presentes = asistencia.filter(function(a) { return a.fecha === hoy && a.estado !== 'Ausente'; }).length;
  var pendientes = solicitudes.filter(function(s) { return s.estado === 'Pendiente'; }).length;
  var ausentes = solicitudes.filter(function(s) { return s.estado === 'Aprobada' && s.fechaInicio <= hoy && s.fechaFin >= hoy; }).length;
  document.getElementById('totalEmpleados').textContent = activos;
  document.getElementById('presentesHoy').textContent = presentes || activos - ausentes;
  document.getElementById('solicitudesPendientes').textContent = pendientes;
  document.getElementById('ausentes').textContent = ausentes;
  document.getElementById('recentTableBody').innerHTML = empleados.slice(-5).reverse().map(function(e) {
    return '<tr><td><strong>' + e.nombre + '</strong></td><td>' + e.cargo + '</td><td>' + e.depto + '</td><td>' + estadoBadge(e.estado) + '</td></tr>';
  }).join('');
  document.getElementById('recentRequests').innerHTML = solicitudes.slice(-5).reverse().map(function(s) {
    var emp = getEmpleado(s.empId); if (!emp) return '';
    return '<div class="request-item"><div class="request-avatar">' + initials(emp.nombre) + '</div><div style="flex:1"><div class="request-name">' + emp.nombre + '</div><div class="request-type">' + s.tipo + ' - ' + s.fechaInicio + '</div></div>' + estadoBadge(s.estado) + '</div>';
  }).join('');
}

function renderEmpleados(filter, depto, estadoFilt) {
  filter = filter || ''; depto = depto || ''; estadoFilt = estadoFilt || '';
  var data = empleados;
  if (filter) data = data.filter(function(e) { return e.nombre.toLowerCase().includes(filter.toLowerCase()) || e.cargo.toLowerCase().includes(filter.toLowerCase()) || e.correo.toLowerCase().includes(filter.toLowerCase()); });
  if (depto) data = data.filter(function(e) { return e.depto === depto; });
  if (estadoFilt) data = data.filter(function(e) { return e.estado === estadoFilt; });
  var tbody = document.getElementById('empleadosTableBody');
  if (!data.length) { tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><div class="empty-state-icon">&#128100;</div><p>No se encontraron empleados</p></div></td></tr>'; return; }
  tbody.innerHTML = data.map(function(e) {
    return '<tr><td><code style="background:var(--gray-100);padding:.2rem .5rem;border-radius:4px;font-size:.75rem">#' + e.id + '</code></td><td><strong>' + e.nombre + '</strong><div style="font-size:.75rem;color:var(--gray-400)">' + (e.contrato||'') + '</div></td><td>' + e.cargo + '</td><td><span class="badge badge-info" style="font-size:.72rem">' + e.depto + '</span></td><td style="color:var(--gray-500)">' + e.correo + '</td><td style="color:var(--gray-500)">' + (e.telefono||'-') + '</td><td>' + estadoBadge(e.estado) + '</td><td><button class="action-btn edit" onclick="openEditEmpleado(' + e.id + ')">&#9998;</button> <button class="action-btn delete" onclick="deleteEmpleado(' + e.id + ')">&#128465;</button></td></tr>';
  }).join('');
}

function openAddEmpleado() {
  editingEmpId = null;
  document.getElementById('modalEmpleadoTitle').textContent = 'Nuevo Empleado';
  document.getElementById('formEmpleado').reset();
  document.getElementById('empFecha').value = new Date().toISOString().split('T')[0];
  document.getElementById('modalEmpleado').classList.add('open');
}
function openEditEmpleado(id) {
  editingEmpId = id; var e = getEmpleado(id);
  document.getElementById('modalEmpleadoTitle').textContent = 'Editar Empleado';
  document.getElementById('empNombre').value = e.nombre;
  document.getElementById('empCorreo').value = e.correo;
  document.getElementById('empCargo').value = e.cargo;
  document.getElementById('empDepto').value = e.depto;
  document.getElementById('empFecha').value = e.fechaIngreso;
  document.getElementById('empSalario').value = e.salario;
  document.getElementById('empEstado').value = e.estado;
  document.getElementById('empTelefono').value = e.telefono || '';
  document.getElementById('empContrato').value = e.contrato || 'Indefinido';
  document.getElementById('empObservaciones').value = e.obs || '';
  if (e.nacimiento) document.getElementById('empNacimiento').value = e.nacimiento;
  document.getElementById('modalEmpleado').classList.add('open');
}
function deleteEmpleado(id) {
  if (!confirm('Eliminar este empleado?')) return;
  empleados = empleados.filter(function(e) { return e.id !== id; });
  saveEmpleados(); renderEmpleados(); renderDashboard();
  showToast('Empleado eliminado', 'error');
}

function renderAsistencia() {
  var fecha = document.getElementById('fechaAsistencia').value || new Date().toISOString().split('T')[0];
  var depto = document.getElementById('filterDeptoAsist').value;
  var data = asistencia.filter(function(a) { return a.fecha === fecha; });
  if (depto) data = data.filter(function(a) { var emp = getEmpleado(a.empId); return emp && emp.depto === depto; });
  var tbody = document.getElementById('asistenciaTableBody');
  if (!data.length) { tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">&#128197;</div><p>Sin registros para esta fecha</p></div></td></tr>'; return; }
  tbody.innerHTML = data.map(function(a) {
    var emp = getEmpleado(a.empId); if (!emp) return '';
    var p1 = a.entrada.split(':').map(Number), p2 = a.salida.split(':').map(Number);
    var horas = ((p2[0]*60+p2[1]) - (p1[0]*60+p1[1])) / 60;
    return '<tr><td><strong>' + emp.nombre + '</strong></td><td><span class="badge badge-info" style="font-size:.72rem">' + emp.depto + '</span></td><td>' + a.entrada + '</td><td>' + a.salida + '</td><td>' + horas.toFixed(1) + 'h</td><td>' + estadoBadge(a.estado) + '</td></tr>';
  }).join('');
}

function renderSolicitudes() {
  var tipo = document.getElementById('filterTipoSol').value;
  var estado = document.getElementById('filterEstadoSol').value;
  var data = solicitudes.slice();
  if (tipo) data = data.filter(function(s) { return s.tipo === tipo; });
  if (estado) data = data.filter(function(s) { return s.estado === estado; });
  var tbody = document.getElementById('solicitudesTableBody');
  if (!data.length) { tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon">&#128196;</div><p>No hay solicitudes</p></div></td></tr>'; return; }
  tbody.innerHTML = data.map(function(s) {
    var emp = getEmpleado(s.empId); if (!emp) return '';
    var dias = diffDays(s.fechaInicio, s.fechaFin);
    var btns = (s.estado==='Pendiente' ? '<button class="action-btn approve" onclick="updateSolicitud('+s.id+',\'Aprobada\')">&#10003;</button> <button class="action-btn reject" onclick="updateSolicitud('+s.id+',\'Rechazada\')">&#10005;</button> ' : '') + '<button class="action-btn delete" onclick="deleteSolicitud('+s.id+')">&#128465;</button>';
    return '<tr><td><strong>' + emp.nombre + '</strong></td><td>' + s.tipo + '</td><td>' + s.fechaInicio + '</td><td>' + s.fechaFin + '</td><td>' + dias + ' dia' + (dias>1?'s':'') + '</td><td>' + estadoBadge(s.estado) + '</td><td>' + btns + '</td></tr>';
  }).join('');
}
function updateSolicitud(id, estado) {
  var s = solicitudes.find(function(x) { return x.id===id; });
  if (s) { s.estado = estado; saveSolicitudes(); renderSolicitudes(); renderDashboard(); showToast('Solicitud ' + estado.toLowerCase(), estado==='Aprobada'?'success':'error'); }
}
function deleteSolicitud(id) {
  if (!confirm('Eliminar esta solicitud?')) return;
  solicitudes = solicitudes.filter(function(s) { return s.id!==id; });
  saveSolicitudes(); renderSolicitudes(); renderDashboard(); showToast('Solicitud eliminada','error');
}
function openAddSolicitud() {
  document.getElementById('formSolicitud').reset();
  document.getElementById('solEmpleado').innerHTML = empleados.filter(function(e){return e.estado==='Activo';}).map(function(e){return '<option value="'+e.id+'">'+e.nombre+'</option>';}).join('');
  document.getElementById('modalSolicitud').classList.add('open');
}

function renderNomina() {
  var mes = parseInt(document.getElementById('filterMesNomina').value);
  var anio = parseInt(document.getElementById('filterAnioNomina').value);
  var activos = empleados.filter(function(e){return e.estado==='Activo';});
  var total = 0;
  document.getElementById('nominaTableBody').innerHTML = activos.map(function(e) {
    var bonos = Math.round(e.salario*.1), ded = Math.round(e.salario*.135), neto = e.salario+bonos-ded;
    total += neto;
    return '<tr><td><strong>'+e.nombre+'</strong></td><td>'+e.cargo+'</td><td><span class="badge badge-info" style="font-size:.72rem">'+e.depto+'</span></td><td>'+formatCLP(e.salario)+'</td><td style="color:var(--success)">'+formatCLP(bonos)+'</td><td style="color:var(--danger)">-'+formatCLP(ded)+'</td><td><strong>'+formatCLP(neto)+'</strong></td><td>'+estadoBadge('Aprobada')+'</td></tr>';
  }).join('');
  document.getElementById('totalNomina').textContent = formatCLP(total);
  document.getElementById('promedioSalario').textContent = activos.length ? formatCLP(Math.round(total/activos.length)) : '$0';
  document.getElementById('totalEmpleadosNomina').textContent = activos.length;
}

function exportNominaPDF() {
  var mes = parseInt(document.getElementById('filterMesNomina').value);
  var anio = parseInt(document.getElementById('filterAnioNomina').value);
  var meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  var activos = empleados.filter(function(e){return e.estado==='Activo';});
  var total = 0;
  var filas = activos.map(function(e) {
    var bonos=Math.round(e.salario*.1), ded=Math.round(e.salario*.135), neto=e.salario+bonos-ded;
    total += neto;
    return '<tr><td>'+e.nombre+'</td><td>'+e.cargo+'</td><td>'+e.depto+'</td><td>'+formatCLP(e.salario)+'</td><td>'+formatCLP(bonos)+'</td><td>-'+formatCLP(ded)+'</td><td><strong>'+formatCLP(neto)+'</strong></td></tr>';
  }).join('');
  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Nomina '+meses[mes-1]+' '+anio+'</title>'+
    '<style>body{font-family:Arial,sans-serif;padding:2cm;color:#111}h1{color:#4F46E5;margin-bottom:.25rem}.subtitle{color:#6B7280;font-size:.9rem;margin-bottom:1.5rem}table{width:100%;border-collapse:collapse;font-size:.85rem}th{background:#4F46E5;color:white;padding:.6rem .875rem;text-align:left;font-size:.75rem;text-transform:uppercase}td{padding:.6rem .875rem;border-bottom:1px solid #E5E7EB}tr:nth-child(even){background:#F9FAFB}.total-row td{border-top:2px solid #4F46E5;font-weight:700;background:#EEF2FF}.footer{margin-top:2rem;font-size:.75rem;color:#9CA3AF;border-top:1px solid #E5E7EB;padding-top:1rem;display:flex;justify-content:space-between}</style>'+
    '</head><body><h1>Reporte de Nomina</h1>'+
    '<div class="subtitle">Periodo: '+meses[mes-1]+' '+anio+' &nbsp;|&nbsp; Generado: '+new Date().toLocaleDateString('es-CL')+' &nbsp;|&nbsp; Por: '+(currentUser?currentUser.nombre:'Sistema')+'</div>'+
    '<table><thead><tr><th>Empleado</th><th>Cargo</th><th>Departamento</th><th>Salario Base</th><th>Bonos (10%)</th><th>Deducciones (13.5%)</th><th>Neto a Pagar</th></tr></thead>'+
    '<tbody>'+filas+'<tr class="total-row"><td colspan="3">TOTAL ('+activos.length+' empleados)</td><td></td><td></td><td></td><td>'+formatCLP(total)+'</td></tr></tbody></table>'+
    '<div class="footer"><span>Portal RRHH</span><span>Promedio: '+formatCLP(activos.length?Math.round(total/activos.length):0)+'</span></div>'+
    '</body></html>';
  var win = window.open('','_blank');
  win.document.write(html); win.document.close(); win.focus();
  setTimeout(function(){win.print();},600);
}

function exportCSV() {
  var fecha = document.getElementById('fechaAsistencia').value || new Date().toISOString().split('T')[0];
  var data = asistencia.filter(function(a){return a.fecha===fecha;});
  var rows = [['Empleado','Departamento','Entrada','Salida','Estado']];
  data.forEach(function(a){var emp=getEmpleado(a.empId);if(emp)rows.push([emp.nombre,emp.depto,a.entrada,a.salida,a.estado]);});
  var csv = rows.map(function(r){return r.map(function(c){return '"'+c+'"';}).join(',');}).join('\n');
  var blob = new Blob([csv],{type:'text/csv'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a'); a.href=url; a.download='asistencia_'+fecha+'.csv'; a.click();
  URL.revokeObjectURL(url);
  showToast('CSV exportado correctamente');
}

function renderUsuarios(filter, rolFilt) {
  filter=filter||''; rolFilt=rolFilt||'';
  var data = usuarios;
  if(filter) data=data.filter(function(u){return u.username.toLowerCase().includes(filter.toLowerCase())||u.nombre.toLowerCase().includes(filter.toLowerCase())||u.correo.toLowerCase().includes(filter.toLowerCase());});
  if(rolFilt) data=data.filter(function(u){return u.rol===rolFilt;});
  var tbody = document.getElementById('usuariosTableBody');
  if(!data.length){tbody.innerHTML='<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon">&#128273;</div><p>No se encontraron usuarios</p></div></td></tr>';return;}
  tbody.innerHTML = data.map(function(u) {
    var acceso = u.ultimoAcceso ? new Date(u.ultimoAcceso).toLocaleDateString('es-CL') : 'Nunca';
    var editBtn = (currentUser&&currentUser.rol==='Administrador') ? '<button class="action-btn edit" onclick="openEditUsuario('+u.id+')">&#9998;</button> ' : '';
    var delBtn = (currentUser&&currentUser.rol==='Administrador'&&u.username!=='admin') ? '<button class="action-btn delete" onclick="deleteUsuario('+u.id+')">&#128465;</button>' : '';
    return '<tr><td><code style="background:var(--gray-100);padding:.2rem .5rem;border-radius:4px;font-size:.75rem">'+u.username+'</code></td><td><strong>'+u.nombre+'</strong></td><td style="color:var(--gray-500)">'+u.correo+'</td><td>'+estadoBadge(u.rol)+'</td><td>'+estadoBadge(u.estado)+'</td><td style="color:var(--gray-400);font-size:.8rem">'+acceso+'</td><td>'+editBtn+delBtn+'</td></tr>';
  }).join('');
}
function openAddUsuario() {
  editingUsrId=null;
  document.getElementById('modalUsuarioTitle').textContent='Crear Usuario';
  document.getElementById('formUsuario').reset();
  document.getElementById('usrError').classList.remove('show');
  document.getElementById('passwordFields').style.display='';
  document.getElementById('usrPassword').required=true;
  document.getElementById('usrPasswordConfirm').required=true;
  document.getElementById('modalUsuario').classList.add('open');
}
function openEditUsuario(id) {
  editingUsrId=id; var u=usuarios.find(function(x){return x.id===id;});
  if(!u) return;
  document.getElementById('modalUsuarioTitle').textContent='Editar Usuario';
  document.getElementById('usrNombre').value=u.nombre;
  document.getElementById('usrUsername').value=u.username;
  document.getElementById('usrCorreo').value=u.correo;
  document.getElementById('usrRol').value=u.rol;
  document.getElementById('usrEstado').value=u.estado;
  document.getElementById('usrError').classList.remove('show');
  document.getElementById('passwordFields').style.display='none';
  document.getElementById('usrPassword').required=false;
  document.getElementById('usrPasswordConfirm').required=false;
  document.getElementById('modalUsuario').classList.add('open');
}
function deleteUsuario(id) {
  var u=usuarios.find(function(x){return x.id===id;});
  if(!u) return;
  if(!confirm('Eliminar usuario "'+u.username+'"?')) return;
  usuarios=usuarios.filter(function(x){return x.id!==id;});
  saveUsuarios(); renderUsuarios(); showToast('Usuario eliminado','error');
}

document.addEventListener('DOMContentLoaded', function() {
  generateAsistencia();
  initLogin();
  var now = new Date();
  document.getElementById('dateDisplay').textContent = now.toLocaleDateString('es-CL',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  document.getElementById('fechaAsistencia').value = now.toISOString().split('T')[0];
  renderDashboard(); renderEmpleados(); renderSolicitudes();

  document.querySelectorAll('.nav-item').forEach(function(item){
    item.addEventListener('click',function(e){e.preventDefault();navigate(item.dataset.section);});
  });
  document.getElementById('topActionBtn').addEventListener('click',function(){
    var s=this.dataset.action;
    if(s==='empleados'||s==='dashboard') openAddEmpleado();
    if(s==='solicitudes') openAddSolicitud();
    if(s==='usuarios') openAddUsuario();
  });
  document.getElementById('menuBtn').addEventListener('click',function(){document.getElementById('sidebar').classList.toggle('open');});
  document.getElementById('sidebarToggle').addEventListener('click',function(){document.getElementById('sidebar').classList.remove('open');});
  document.getElementById('logoutBtn').addEventListener('click',logout);

  document.getElementById('searchEmpleados').addEventListener('input',function(){renderEmpleados(this.value,document.getElementById('filterDepto').value,document.getElementById('filterEstadoEmp').value);});
  document.getElementById('filterDepto').addEventListener('change',function(){renderEmpleados(document.getElementById('searchEmpleados').value,this.value,document.getElementById('filterEstadoEmp').value);});
  document.getElementById('filterEstadoEmp').addEventListener('change',function(){renderEmpleados(document.getElementById('searchEmpleados').value,document.getElementById('filterDepto').value,this.value);});
  document.getElementById('addEmpleadoBtn').addEventListener('click',openAddEmpleado);
  document.getElementById('fechaAsistencia').addEventListener('change',renderAsistencia);
  document.getElementById('filterDeptoAsist').addEventListener('change',renderAsistencia);
  document.getElementById('exportAsistBtn').addEventListener('click',exportCSV);
  document.getElementById('filterTipoSol').addEventListener('change',renderSolicitudes);
  document.getElementById('filterEstadoSol').addEventListener('change',renderSolicitudes);
  document.getElementById('addSolicitudBtn').addEventListener('click',openAddSolicitud);
  document.getElementById('filterMesNomina').addEventListener('change',renderNomina);
  document.getElementById('filterAnioNomina').addEventListener('change',renderNomina);
  document.getElementById('exportNominaBtn').addEventListener('click',exportNominaPDF);
  document.getElementById('searchUsuarios').addEventListener('input',function(){renderUsuarios(this.value,document.getElementById('filterRolUsuario').value);});
  document.getElementById('filterRolUsuario').addEventListener('change',function(){renderUsuarios(document.getElementById('searchUsuarios').value,this.value);});
  document.getElementById('addUsuarioBtn').addEventListener('click',openAddUsuario);
  document.getElementById('toggleUsrPass').addEventListener('click',function(){var i=document.getElementById('usrPassword');i.type=i.type==='password'?'text':'password';});
  document.getElementById('toggleUsrPassConfirm').addEventListener('click',function(){var i=document.getElementById('usrPasswordConfirm');i.type=i.type==='password'?'text':'password';});

  ['closeModalEmpleado','cancelModalEmpleado'].forEach(function(id){document.getElementById(id).addEventListener('click',function(){document.getElementById('modalEmpleado').classList.remove('open');});});
  document.getElementById('modalEmpleado').addEventListener('click',function(e){if(e.target===this)this.classList.remove('open');});
  document.getElementById('formEmpleado').addEventListener('submit',function(e){
    e.preventDefault();
    var emp={nombre:document.getElementById('empNombre').value.trim(),correo:document.getElementById('empCorreo').value.trim(),cargo:document.getElementById('empCargo').value.trim(),depto:document.getElementById('empDepto').value,fechaIngreso:document.getElementById('empFecha').value,salario:parseInt(document.getElementById('empSalario').value),estado:document.getElementById('empEstado').value,telefono:document.getElementById('empTelefono').value.trim(),contrato:document.getElementById('empContrato').value,nacimiento:document.getElementById('empNacimiento').value,obs:document.getElementById('empObservaciones').value.trim()};
    if(editingEmpId){var idx=empleados.findIndex(function(x){return x.id===editingEmpId;});empleados[idx]=Object.assign({},empleados[idx],emp);showToast('Empleado actualizado');}
    else{empleados.push(Object.assign({id:nextEmpId++},emp));showToast('Empleado agregado exitosamente');}
    saveEmpleados();document.getElementById('modalEmpleado').classList.remove('open');renderEmpleados();renderDashboard();
  });

  ['closeModalSolicitud','cancelModalSolicitud'].forEach(function(id){document.getElementById(id).addEventListener('click',function(){document.getElementById('modalSolicitud').classList.remove('open');});});
  document.getElementById('modalSolicitud').addEventListener('click',function(e){if(e.target===this)this.classList.remove('open');});
  document.getElementById('formSolicitud').addEventListener('submit',function(e){
    e.preventDefault();
    solicitudes.push({id:nextSolId++,empId:parseInt(document.getElementById('solEmpleado').value),tipo:document.getElementById('solTipo').value,fechaInicio:document.getElementById('solFechaInicio').value,fechaFin:document.getElementById('solFechaFin').value,estado:document.getElementById('solEstado').value,obs:document.getElementById('solObservaciones').value.trim()});
    saveSolicitudes();document.getElementById('modalSolicitud').classList.remove('open');renderSolicitudes();renderDashboard();showToast('Solicitud creada exitosamente');
  });

  ['closeModalUsuario','cancelModalUsuario'].forEach(function(id){document.getElementById(id).addEventListener('click',function(){document.getElementById('modalUsuario').classList.remove('open');});});
  document.getElementById('modalUsuario').addEventListener('click',function(e){if(e.target===this)this.classList.remove('open');});
  document.getElementById('formUsuario').addEventListener('submit',function(e){
    e.preventDefault();
    var errEl=document.getElementById('usrError');
    var username=document.getElementById('usrUsername').value.trim().toLowerCase();
    var pass=document.getElementById('usrPassword').value;
    var passConfirm=document.getElementById('usrPasswordConfirm').value;
    if(!editingUsrId){
      if(pass.length<6){errEl.textContent='La contrasena debe tener al menos 6 caracteres';errEl.classList.add('show');return;}
      if(pass!==passConfirm){errEl.textContent='Las contrasenas no coinciden';errEl.classList.add('show');return;}
      if(usuarios.find(function(u){return u.username===username;})){errEl.textContent='Ese nombre de usuario ya esta en uso';errEl.classList.add('show');return;}
    }
    errEl.classList.remove('show');
    if(editingUsrId){
      var idx=usuarios.findIndex(function(x){return x.id===editingUsrId;});
      usuarios[idx]=Object.assign({},usuarios[idx],{nombre:document.getElementById('usrNombre').value.trim(),correo:document.getElementById('usrCorreo').value.trim(),rol:document.getElementById('usrRol').value,estado:document.getElementById('usrEstado').value});
      showToast('Usuario actualizado');
    } else {
      usuarios.push({id:nextUsrId++,username:username,nombre:document.getElementById('usrNombre').value.trim(),correo:document.getElementById('usrCorreo').value.trim(),password:pass,rol:document.getElementById('usrRol').value,estado:document.getElementById('usrEstado').value,ultimoAcceso:null});
      showToast('Usuario creado exitosamente');
    }
    saveUsuarios();document.getElementById('modalUsuario').classList.remove('open');renderUsuarios();
  });
});
import initSqlJs from 'sql.js';

    let db;

    const initializeDB = async () => {
      try {
        const SQL = await initSqlJs({
          locateFile: (file) => `https://sql.js.org/dist/${file}`
        });

        db = new SQL.Database();

        // Crear la tabla si no existe
        db.run(`
          CREATE TABLE IF NOT EXISTS kssd00conver (
            id TEXT PRIMARY KEY,
            cliente TEXT,
            viaContacto TEXT CHECK(viaContacto IN ('Correo', 'Llamada', 'Whatsapp')),
            fecha TEXT,
            correo TEXT,
            empresa TEXT,           
            ruc TEXT,
            consulta TEXT,
            interactions TEXT,
            estado TEXT CHECK(estado IN ('en-conversacion', 'proceso-terminado')),
            telefono TEXT           
          );

        `);
        
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };

    const dbMethods = {
      async addCard(card) {
        if (!db) await initializeDB();
        const id = `card-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        // Recomendable: especificar los campos de manera explícita:
        db.run(
          `INSERT INTO kssd00conver
            (id, cliente, viaContacto, fecha, correo, empresa, ruc, consulta, interactions, estado, telefono)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            id,
            card.cliente,
            card.viaContacto,
            card.fecha,
            card.correo,
            card.empresa, // Ojo: corresponde a la columna "empresa"
            card.ruc,
            card.consulta,
            JSON.stringify(card.interactions),
            'en-conversacion',
            card.telefono // <-- valor para la columna "telefono"
          ]
        );
        return id;
      },

      async updateCard(card) {
        if (!db) await initializeDB();
        db.run(
          `UPDATE kssd00conver SET
            cliente = ?,
            viaContacto = ?,
            fecha = ?,
            correo = ?,
            empresa = ?,
            ruc = ?,
            consulta = ?,
            interactions = ?,
            estado = ?,
            telefono = ?
          WHERE id = ?`,
          [
            card.cliente,
            card.viaContacto,
            card.fecha,
            card.correo,
            card.empresa,       // Reemplazar "nombreCliente" por "empresa"
            card.ruc,
            card.consulta,
            JSON.stringify(card.interactions),
            card.estado,
            card.telefono,      // Nuevo valor
            card.id
          ]
        );
                      },

      async getCards() {
        if (!db) await initializeDB();
        const result = db.exec(`SELECT * FROM kssd00conver`);
        if (result.length === 0) return [];
        return result[0].values.map((row) => ({
          id: row[0],
          cliente: row[1],
          viaContacto: row[2],
          fecha: row[3],
          correo: row[4],
          empresa: row[5],         // antes tenías row[5] como nombreCliente
          ruc: row[6],
          consulta: row[7],
          interactions: JSON.parse(row[8]),
          estado: row[9],
          telefono: row[10]        // <-- Columna 11 (índice 10)
        }));
        
      }
    };

    // Inicializar la base de datos al cargar el módulo
    initializeDB();

    export { dbMethods as db };

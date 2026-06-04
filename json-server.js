// import jsonServer from "json-server";
// import { Client } from "basic-ftp";
// import Papa from "papaparse";
// import { Readable } from "stream";
// import cors from "cors"

// const server = jsonServer.create();
// const router = jsonServer.router('db.json');
// const middlewares = jsonServer.defaults();

// server.use(cors());
// server.use(middlewares);
// server.use(jsonServer.bodyParser);

// server.post("/upload-ftp", (req, res) => {
// 	const { ftpConfig, stockData } = req.body;

// 	// Validate FTP configuration
// 	if (
// 		!ftpConfig ||
// 		!ftpConfig.host ||
// 		!ftpConfig.username ||
// 		!ftpConfig.password ||
// 		!ftpConfig.port ||
// 		!ftpConfig.name
// 	) {
// 		res.status(400).json({ error: "Missing or incomplete FTP configuration" });
// 		return;
// 	}

// 	// Validate stock data
// 	if (!stockData || !Array.isArray(stockData) || stockData.length === 0) {
// 		res.status(400).json({ error: "No stock data provided" });
// 		return;
// 	}

// 	// Convert stock data to CSV
// 	const csv = Papa.unparse(
// 		stockData.map((item) => ({
// 			"Part Number": item["Part Number"],
// 			"In Stock": item["In Stock"],
// 			"Date Time": item["Date Time"],
// 		}))
// 	);

// 	const client = new Client();
// 	client.ftp.verbose = true; // Optional: Enable verbose logging for debugging

// 	client
// 	.access({
// 		host: ftpConfig.host,
// 		port: parseInt(ftpConfig.port),
// 		user: ftpConfig.username,
// 		password: ftpConfig.password,
// 		secure: true, // Forces secure FTPS connection
// 		secureOptions: {
// 			rejectUnauthorized: false // Prevents self-signed certificate errors from crashing the connection
// 		}
// 	})
// 		.then(() => {
// 			// Create a readable stream from the CSV string using a custom implementation
// 			const csvStream = Readable.from([csv]);

// 			return client.uploadFrom(csvStream, "PSC_Stock.csv");
// 		})
// 		.then(() => {
// 			console.log(`File uploaded successfully to ${ftpConfig.name}`);
// 			res.json({ message: "File uploaded successfully" });
// 		})
// 		.catch((err) => {
// 			console.error(`FTP error for ${ftpConfig.name}:`, err);
// 			res.status(500).json({ error: `FTP upload failed: ${err.message}` });
// 		})
// 		.finally(() => {
// 			client.close(); // Ensure client is closed regardless of success or failure
// 		});
// });

// server.use(router);
// server.listen(3001, () => {
// 	console.log("JSON Server is running on port 3001");
// });


import jsonServer from "json-server";
import { Client } from "basic-ftp";
import Papa from "papaparse";
import { Readable } from "stream";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Manually define __dirname since you are using ES modules (import statements)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = jsonServer.create();

// FIX: Explicitly resolve the absolute path to your stock directory db file
const router = jsonServer.router(path.join(__dirname, "stock", "db.json"));
const middlewares = jsonServer.defaults();

// Apply CORS before routers/routes
server.use(cors());
server.use(middlewares);
server.use(jsonServer.bodyParser);

server.post("/upload-ftp", (req, res) => {
	const { ftpConfig, stockData } = req.body;

	// Validate FTP configuration
	if (
		!ftpConfig ||
		!ftpConfig.host ||
		!ftpConfig.username ||
		!ftpConfig.password ||
		!ftpConfig.port ||
		!ftpConfig.name
	) {
		res.status(400).json({ error: "Missing or incomplete FTP configuration" });
		return;
	}

	// Validate stock data
	if (!stockData || !Array.isArray(stockData) || stockData.length === 0) {
		res.status(400).json({ error: "No stock data provided" });
		return;
	}

	// Convert stock data to CSV
	const csv = Papa.unparse(
		stockData.map((item) => ({
			"Part Number": item["Part Number"],
			"In Stock": item["In Stock"] || item["IN Stock"] || 0,
			"Date Time": item["Date Time"],
		}))
	);

	const client = new Client();
	client.ftp.verbose = true; 

	// Configure the connection parameters dynamically based on the port provided
	const connectionOptions = {
		host: ftpConfig.host,
		port: parseInt(ftpConfig.port),
		user: ftpConfig.username,
		password: ftpConfig.password,
		// If port 18 is a non-standard plain text gateway, secure: true might fail.
		// Keep secure: true for Port 21/990 networks.
		secure: ftpConfig.port === 21 || ftpConfig.port === 990, 
		secureOptions: {
			rejectUnauthorized: false 
		}
	};

	client
		.access(connectionOptions)
		.then(() => {
			const csvStream = Readable.from([csv]);
			return client.uploadFrom(csvStream, "PSC_Stock.csv");
		})
		.then(() => {
			console.log(`File uploaded successfully to ${ftpConfig.name}`);
			res.json({ message: "File uploaded successfully" });
		})
		.catch((err) => {
			console.error(`FTP error for ${ftpConfig.name}:`, err);
			res.status(500).json({ error: `FTP upload failed: ${err.message}` });
		})
		.finally(() => {
			client.close(); 
		});
});

server.use(router);
server.listen(3001, () => {
	console.log("JSON Server is running on port 3001");
});
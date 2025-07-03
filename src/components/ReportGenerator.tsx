// import React, { useState, useEffect } from "react";
// import saveAs from "file-saver";
// import { utils, write } from "xlsx";
// import * as ExcelJS from "exceljs";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { Form, Button, Row, Col, Card, Alert } from "react-bootstrap";

// interface SalesData {
// 	orderTotal: number;
// 	salesTotal: number;
// 	clicks: number;
// 	impressions: number;
// 	topSeller: string;
// }

// interface PreviousSalesData {
// 	orderTotal?: number;
// 	salesTotal?: number;
// 	clicks?: number;
// 	impressions?: number;
// }

// export default function ReportGenerator({ onBack }: { onBack: () => void }) {
// 	const [salesData, setSalesData] = useState<SalesData>({
// 		orderTotal: 0,
// 		salesTotal: 0,
// 		clicks: 0,
// 		impressions: 0,
// 		topSeller: "",
// 	});

// 	const [previousTopSellers, setPreviousTopSellers] = useState<string[]>([]);
// 	const [previousSalesData, setPreviousSalesData] = useState<PreviousSalesData>(
// 		{}
// 	);
// 	const [alertMessage, setAlertMessage] = useState<string | null>(null);
// 	const [startDate, setStartDate] = useState<string>("");

// 	useEffect(() => {
// 		const loadFromLocalStorage = (
// 			key: string
// 		): string[] | PreviousSalesData => {
// 			const storedData = localStorage.getItem(key);
// 			if (storedData) {
// 				try {
// 					return JSON.parse(storedData);
// 				} catch (e) {
// 					console.error(`Error parsing ${key} data:`, e);
// 					return key === "topSellers" ? [] : {};
// 				}
// 			}
// 			return key === "topSellers" ? [] : {};
// 		};

// 		setPreviousTopSellers(loadFromLocalStorage("topSellers") as string[]);
// 		setPreviousSalesData(
// 			loadFromLocalStorage("salesData") as PreviousSalesData
// 		);
// 	}, []);

// 	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// 		const { name, value } = e.target;
// 		let parsedValue: string | number;

// 		if (name === "topSeller") {
// 			parsedValue = value;
// 		} else {
// 			parsedValue = parseFloat(value) || 0;
// 			if (["clicks", "impressions"].includes(name)) {
// 				parsedValue *= 1000;
// 			}
// 		}

// 		setSalesData((prevState) => ({
// 			...prevState,
// 			[name]: parsedValue as number | string,
// 		}));
// 	};

// 	const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// 		setStartDate(e.target.value);
// 	};

// 	const calculatePercentageChange = (
// 		current: number,
// 		previous: number
// 	): number => (previous !== 0 ? ((current - previous) / previous) * 100 : 0);

// 	const generateReport = async () => {
// 		if (!startDate) {
// 			setAlertMessage("Please select a start date.");
// 			return;
// 		}

// 		const { orderTotal, salesTotal, clicks, impressions, topSeller } =
// 			salesData;
// 		const {
// 			orderTotal: prevOrderTotal = 0,
// 			salesTotal: prevSalesTotal = 0,
// 			clicks: prevClicks = 0,
// 			impressions: prevImpressions = 0,
// 		} = previousSalesData;

// 		const conversionRate = orderTotal > 0 ? (orderTotal / clicks) * 100 : 0;
// 		const avgOrderValue = orderTotal > 0 ? salesTotal / orderTotal : 0;
// 		const clickThroughRate = impressions > 0 ? (clicks / impressions) * 100 : 0;

// 		const metrics = [
// 			{ key: "Order Total", current: orderTotal, previous: prevOrderTotal },
// 			{ key: "Sales Total", current: salesTotal, previous: prevSalesTotal },
// 			{ key: "Clicks", current: clicks, previous: prevClicks },
// 			{ key: "Impressions", current: impressions, previous: prevImpressions },
// 			{
// 				key: "Click Through Rate",
// 				current: clickThroughRate,
// 				previous:
// 					prevImpressions > 0 ? (prevClicks / prevImpressions) * 100 : 0,
// 			},
// 			{
// 				key: "Average Order Value",
// 				current: avgOrderValue,
// 				previous: prevOrderTotal > 0 ? prevSalesTotal / prevOrderTotal : 0,
// 			},
// 			{
// 				key: "Conversion Rate (%)",
// 				current: conversionRate,
// 				previous: prevClicks > 0 ? (prevOrderTotal / prevClicks) * 100 : 0,
// 			},
// 		];

// 		const updatedTopSellers = [topSeller, ...previousTopSellers]
// 			.filter(Boolean)
// 			.slice(0, 4);

// 		try {
// 			localStorage.setItem("topSellers", JSON.stringify(updatedTopSellers));
// 			localStorage.setItem(
// 				"salesData",
// 				JSON.stringify({ orderTotal, salesTotal, clicks, impressions })
// 			);
// 			setPreviousTopSellers(updatedTopSellers);
// 			setPreviousSalesData({ orderTotal, salesTotal, clicks, impressions });
// 		} catch (e) {
// 			setAlertMessage("Error saving data to localStorage.");
// 			console.error("Error saving to localStorage:", e);
// 			return;
// 		}

// 		const reportStartDate = new Date(startDate);
// 		const reportEndDate = new Date(reportStartDate);
// 		reportStartDate.setDate(reportStartDate.getDate() - 6);

// 		const formattedStartDate = reportStartDate.toISOString().split("T")[0];
// 		const formattedEndDate = reportEndDate.toISOString().split("T")[0];

// 		const worksheetData = [
// 			[`Ecommerce Report (${formattedStartDate} to ${formattedEndDate})`],
// 			["Metric", "Last Week", "Current", "Change (%)"],
// 			...metrics.map((item) => [
// 				item.key,
// 				item.previous.toFixed(2),
// 				item.current.toFixed(2),
// 				calculatePercentageChange(item.current, item.previous).toFixed(2),
// 			]),
// 			["Top Sellers (Last 4 Weeks)"],
// 			...updatedTopSellers.map((seller) => ["", seller]),
// 		];

// 		const worksheet = utils.aoa_to_sheet(worksheetData);
// 		const workbook = utils.book_new();
// 		utils.book_append_sheet(workbook, worksheet, "Sales Report");

// 		try {
// 			const excelBuffer = write(workbook, { bookType: "xlsx", type: "array" });
// 			const blob = new Blob([excelBuffer], {
// 				type: "application/octet-stream",
// 			});

// 			const workbookExcelJS = new ExcelJS.Workbook();
// 			const worksheetExcelJS = workbookExcelJS.addWorksheet("Sales Report");

// 			const arrayBuffer = await blob.arrayBuffer();
// 			await workbookExcelJS.xlsx.load(arrayBuffer);

// 			worksheetExcelJS.getCell("A1").font = { bold: true, size: 14 };
// 			worksheetExcelJS.getRow(1).fill = {
// 				type: "pattern",
// 				pattern: "solid",
// 				fgColor: { argb: "FFFF00" },
// 			};

// 			const topSellersStartRow =
// 				worksheetData.findIndex(
// 					(row) => row[0] === "Top Sellers (Last 4 Weeks)"
// 				) + 1;

// 			for (let i = 0; i < updatedTopSellers.length; i++) {
// 				worksheetExcelJS.getCell(`B${topSellersStartRow + i + 1}`).font = {
// 					italic: true,
// 				};
// 			}

// 			const styledExcelBuffer = await workbookExcelJS.xlsx.writeBuffer();

// 			saveAs(
// 				new Blob([styledExcelBuffer], {
// 					type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
// 				}),
// 				`ECR_${formattedEndDate}.xlsx`
// 			);

// 			setAlertMessage("Report generated successfully!");
// 			toast.success("Report generated successfully!");
// 		} catch (e) {
// 			setAlertMessage("Error generating the Excel file.");
// 			console.error("Error in generating or saving Excel file:", e);
// 			toast.error("Error generating the Excel file.");
// 		}
// 	};

// 	// STEP 4: Fetch Google Search Console data automatically
// 	const fetchGSC = async () => {
// 		try {
// 			const res = await fetch(
// 				"http://localhost:4000/api/search-console-last-week"
// 			);
// 			if (!res.ok) {
// 				throw new Error("Failed to fetch Search Console data");
// 			}
// 			const data = await res.json();
// 			setSalesData((prev) => ({
// 				...prev,
// 				clicks: data.clicks,
// 				impressions: data.impressions,
// 			}));
// 			toast.success(
// 				`Fetched Search Console data: ${data.clicks} clicks, ${data.impressions} impressions`
// 			);
// 		} catch (err) {
// 			console.error(err);
// 			toast.error("Failed to fetch Search Console data.");
// 		}
// 	};

// 	const todaysDate = new Date().toLocaleDateString();

// 	return (
// 		<>
// 			<ToastContainer />
// 			{onBack && (
// 				<button className="btn btn-link mb-3" onClick={onBack}>
// 					← Back to Dashboard
// 				</button>
// 			)}

// 			{/* Fixed logo in top-left corner as a link */}
// 			<div
// 				style={{ position: "fixed", top: "40px", left: "40px", zIndex: 1000 }}
// 			>
// 				<a
// 					href="#"
// 					onClick={(e) => {
// 						e.preventDefault();
// 						if (onBack) onBack();
// 					}}
// 				>
// 					<img src="/logo.png" alt="Logo" style={{ height: "75px" }} />
// 				</a>
// 			</div>

// 			<div className="container mt-5 pt-4">
// 				<div className="text-center mb-4 mt-3">
// 					<h1 className="mb-2">Weekly Sales Report Generator</h1>
// 					<h5 className="mb-0">Today's Date: {todaysDate}</h5>
// 				</div>
// 				<div className="mb-4" style={{ maxWidth: "600px", margin: "0 auto" }}>
// 					{alertMessage && <Alert variant="info">{alertMessage}</Alert>}
// 					<Card className="shadow-lg p-4">
// 						<Form>
// 							<Form.Group controlId="startDate" className="mb-4">
// 								<Form.Label>Select Start Date</Form.Label>
// 								<Form.Control
// 									type="date"
// 									value={startDate}
// 									onChange={handleDateChange}
// 								/>
// 							</Form.Group>

// 							<Button
// 								variant="secondary"
// 								className="w-100 mb-4"
// 								type="button"
// 								onClick={fetchGSC}
// 							>
// 								Fetch Google Search Console Data (Clicks & Impressions)
// 							</Button>

// 							<Row className="mb-3">
// 								<Col sm={6}>
// 									<Form.Group controlId="orderTotal">
// 										<Form.Label>Order Total</Form.Label>
// 										<Form.Control
// 											type="number"
// 											name="orderTotal"
// 											onChange={handleInputChange}
// 											placeholder="Enter order total"
// 										/>
// 									</Form.Group>
// 								</Col>
// 								<Col sm={6}>
// 									<Form.Group controlId="salesTotal">
// 										<Form.Label>Sales Total</Form.Label>
// 										<Form.Control
// 											type="number"
// 											name="salesTotal"
// 											onChange={handleInputChange}
// 											placeholder="Enter sales total"
// 										/>
// 									</Form.Group>
// 								</Col>
// 							</Row>

// 							<Row className="mb-3">
// 								<Col sm={6}>
// 									<Form.Group controlId="clicks">
// 										<Form.Label>Clicks (in thousands)</Form.Label>
// 										<Form.Control
// 											type="number"
// 											name="clicks"
// 											value={salesData.clicks ? salesData.clicks / 1000 : ""}
// 											onChange={handleInputChange}
// 											placeholder="Enter clicks"
// 										/>
// 									</Form.Group>
// 								</Col>
// 								<Col sm={6}>
// 									<Form.Group controlId="impressions">
// 										<Form.Label>Impressions (in thousands)</Form.Label>
// 										<Form.Control
// 											type="number"
// 											name="impressions"
// 											value={
// 												salesData.impressions
// 													? salesData.impressions / 1000
// 													: ""
// 											}
// 											onChange={handleInputChange}
// 											placeholder="Enter impressions"
// 										/>
// 									</Form.Group>
// 								</Col>
// 							</Row>

// 							<Row className="mb-4">
// 								<Col sm={6}>
// 									<Form.Group controlId="topSeller">
// 										<Form.Label>Top Seller</Form.Label>
// 										<Form.Control
// 											type="text"
// 											name="topSeller"
// 											onChange={handleInputChange}
// 											placeholder="Enter top seller of the week"
// 										/>
// 									</Form.Group>
// 								</Col>
// 							</Row>

// 							<Button
// 								variant="primary"
// 								className="w-100"
// 								onClick={generateReport}
// 								type="button"
// 							>
// 								Generate Report
// 							</Button>
// 						</Form>
// 					</Card>
// 				</div>
// 			</div>
// 		</>
// 	);
// }

import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type GoogleData = {
	startDate: string;
	endDate: string;
	clicks: number;
	impressions: number;
};

type MagentoTopSellingItem = {
	name: string;
	sku: string;
	quantity: number;
};

type MagentoData = {
	totalOrders: number;
	salesTotal: number;
	topSellingItem?: MagentoTopSellingItem;
};

function formatCurrency(n: number | string | undefined) {
	if (!n && n !== 0) return "";
	return `$${Number(n).toLocaleString(undefined, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`;
}

function formatPercent(n: number | string | undefined, decimals = 2) {
	if (n === undefined || n === null || isNaN(Number(n))) return "";
	return `${Number(n).toFixed(decimals)}%`;
}

export default function ReportGenerator({ onBack }: { onBack: () => void }) {
	const [lead, setLead] = useState<{ name: string; email: string }>(() => {
		const saved = localStorage.getItem("lead");
		return saved ? JSON.parse(saved) : { name: "", email: "" };
	});
	const [editingLead, setEditingLead] = useState(false);
	const [google, setGoogle] = useState<GoogleData | null>(null);
	const [magento, setMagento] = useState<MagentoData | null>(null);
	const [loading, setLoading] = useState(false);
	const [csvUrl, setCsvUrl] = useState("");
	const [error, setError] = useState("");
	const [successMsg, setSuccessMsg] = useState("");

	function handleEditLead() {
		setEditingLead(true);
	}
	function handleLeadSave(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setEditingLead(false);
		localStorage.setItem("lead", JSON.stringify(lead));
		toast.success("Lead info saved");
	}
	function handleLeadChange(e: React.ChangeEvent<HTMLInputElement>) {
		setLead({ ...lead, [e.target.name]: e.target.value });
	}

	async function handlePullData() {
		setLoading(true);
		setError("");
		setSuccessMsg("");
		try {
			const [gRes, mRes] = await Promise.all([
				fetch("http://localhost:4000/api/search-console-last-week"),
				fetch("http://localhost:4000/api/magento-report-last-week"),
			]);
			if (!gRes.ok || !mRes.ok) throw new Error("Failed to pull data.");
			const googleData = await gRes.json();
			const magentoData = await mRes.json();
			setGoogle(googleData);
			setMagento(magentoData);
			toast.success("Data loaded!");
		} catch (e) {
			setError("Failed to load data.");
			toast.error("Failed to load data.");
		}
		setLoading(false);
	}

	function generateCsv() {
		if (!google || !magento) return;
		const orderTotal = magento.totalOrders;
		const salesTotal = magento.salesTotal;
		const clicks = google.clicks;
		const impressions = google.impressions;
		const ctr = impressions ? clicks / impressions : 0;
		const avgOrderValue = orderTotal ? salesTotal / orderTotal : 0;
		const conversionRate = clicks ? (orderTotal / clicks) * 100 : 0;
		const topSeller = magento.topSellingItem?.name ?? "";

		const rows = [
			["Report for", `${google.startDate} to ${google.endDate}`],
			[],
			["Lead Name", lead.name],
			["Lead Email", lead.email],
			[],
			["Order Total", orderTotal],
			["Sales Total", formatCurrency(salesTotal)],
			["Clicks", clicks],
			["Impressions", impressions],
			["Click Through Rate", formatPercent(ctr * 100)],
			["Average Order Value", formatCurrency(avgOrderValue)],
			["Conversion Rate (%)", formatPercent(conversionRate)],
			["Top Seller", topSeller],
		];
		const csv = rows
			.map((row) =>
				row
					.map((x) => `"${(x ?? "").toString().replace(/"/g, '""')}"`)
					.join(",")
			)
			.join("\r\n");
		const blob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		setCsvUrl(url);
	}

	async function handleEmailCsv() {
		if (!google || !magento || !lead.email) {
			setError("Missing data or lead info!");
			toast.error("Missing data or lead info!");
			return;
		}
		setLoading(true);
		setError("");
		setSuccessMsg("");
		try {
			const resp = await fetch("/api/email-report", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					lead,
					google,
					magento,
				}),
			});
			if (!resp.ok) throw new Error();
			setSuccessMsg("Email sent to lead!");
			toast.success("Email sent to lead!");
		} catch (e) {
			setError("Failed to email report.");
			toast.error("Failed to email report.");
		}
		setLoading(false);
	}

	React.useEffect(() => {
		if (google && magento) generateCsv();
		// eslint-disable-next-line
	}, [google, magento, lead]);

	// Calculated stats for display
	const orderTotal = magento?.totalOrders;
	const salesTotal = magento?.salesTotal;
	const clicks = google?.clicks;
	const impressions = google?.impressions;
	const ctr = impressions ? clicks! / impressions : undefined;
	const avgOrderValue = orderTotal ? salesTotal! / orderTotal : undefined;
	const conversionRate = clicks ? (orderTotal! / clicks) * 100 : undefined;
	const topSeller = magento?.topSellingItem?.name;

	return (
		<div className="container mt-5 pt-4" style={{ position: "relative" }}>
			<ToastContainer />
			<div
				style={{
					position: "fixed",
					top: "40px",
					left: "40px",
					zIndex: 1000,
				}}
			>
				<a
					href="#"
					onClick={(e) => {
						e.preventDefault();
						if (onBack) onBack();
					}}
				>
					<img src="/logo.png" alt="Logo" style={{ height: "75px" }} />
				</a>
			</div>
			<div className="text-center mb-4 mt-3">
				<h1 className="mb-2">Weekly Report Generator</h1>
				<div className="mb-0 text-secondary" style={{ minHeight: 28 }}>
					{google && magento ? (
						<span>
							Date Range: {google.startDate} to {google.endDate}
						</span>
					) : (
						<span>
							Date Range: <span className="text-muted">—</span>
						</span>
					)}
				</div>
			</div>
			<div className="mb-3 text-center">
				<div className="mb-2">
					<strong>Lead:</strong>{" "}
					{editingLead ? (
						<form
							className="d-inline-block"
							style={{ maxWidth: 400 }}
							onSubmit={handleLeadSave}
						>
							<input
								name="name"
								placeholder="Name"
								value={lead.name}
								onChange={handleLeadChange}
								required
								className="form-control d-inline-block me-2 mb-2"
								style={{ width: 150 }}
							/>
							<input
								name="email"
								placeholder="Email"
								value={lead.email}
								onChange={handleLeadChange}
								required
								type="email"
								className="form-control d-inline-block me-2 mb-2"
								style={{ width: 200 }}
							/>
							<button
								type="submit"
								className="btn btn-success btn-sm me-2 mb-2"
							>
								Save
							</button>
							<button
								type="button"
								className="btn btn-secondary btn-sm mb-2"
								onClick={() => setEditingLead(false)}
							>
								Cancel
							</button>
						</form>
					) : (
						<>
							{lead.name ? (
								<>
									{lead.name} ({lead.email}){" "}
									<a
										href="#"
										onClick={(e) => {
											e.preventDefault();
											handleEditLead();
										}}
									>
										Edit
									</a>
								</>
							) : (
								<a
									href="#"
									onClick={(e) => {
										e.preventDefault();
										handleEditLead();
									}}
								>
									Set Lead
								</a>
							)}
						</>
					)}
				</div>
				<div className="d-flex justify-content-center flex-wrap gap-2 mb-3">
					<button
						onClick={handlePullData}
						className="btn btn-primary mt-2"
						disabled={loading}
					>
						{loading ? "Loading..." : "Pull Data"}
					</button>
					<a
						href={csvUrl}
						download={`report_${google?.startDate}_to_${google?.endDate}.csv`}
						style={{ pointerEvents: csvUrl ? "auto" : "none" }}
					>
						<button className="btn btn-outline-primary mt-2" disabled={!csvUrl}>
							Generate CSV
						</button>
					</a>
					<button
						onClick={handleEmailCsv}
						className="btn btn-success mt-2"
						disabled={loading || !csvUrl}
					>
						Email CSV to My Lead
					</button>
				</div>
			</div>
			<div className="row justify-content-center">
				<div className="col-md-12 col-lg-10 mb-4">
					<div className="card shadow-sm">
						<div className="card-header bg-info text-dark fw-bold">
							Report Summary
						</div>
						<div className="card-body">
							<div className="row">
								<div className="col-sm-6 col-md-4 mb-3">
									<div>
										<strong>Order Total</strong>
									</div>
									<div>
										{orderTotal !== undefined ? (
											orderTotal
										) : (
											<span className="text-muted">—</span>
										)}
									</div>
								</div>
								<div className="col-sm-6 col-md-4 mb-3">
									<div>
										<strong>Sales Total</strong>
									</div>
									<div>
										{salesTotal !== undefined ? (
											formatCurrency(salesTotal)
										) : (
											<span className="text-muted">—</span>
										)}
									</div>
								</div>
								<div className="col-sm-6 col-md-4 mb-3">
									<div>
										<strong>Clicks</strong>
									</div>
									<div>
										{clicks !== undefined ? (
											clicks
										) : (
											<span className="text-muted">—</span>
										)}
									</div>
								</div>
								<div className="col-sm-6 col-md-4 mb-3">
									<div>
										<strong>Impressions</strong>
									</div>
									<div>
										{impressions !== undefined ? (
											impressions
										) : (
											<span className="text-muted">—</span>
										)}
									</div>
								</div>
								<div className="col-sm-6 col-md-4 mb-3">
									<div>
										<strong>Click Through Rate</strong>
									</div>
									<div>
										{ctr !== undefined ? (
											formatPercent(ctr * 100)
										) : (
											<span className="text-muted">—</span>
										)}
									</div>
								</div>
								<div className="col-sm-6 col-md-4 mb-3">
									<div>
										<strong>Average Order Value</strong>
									</div>
									<div>
										{avgOrderValue !== undefined ? (
											formatCurrency(avgOrderValue)
										) : (
											<span className="text-muted">—</span>
										)}
									</div>
								</div>
								<div className="col-sm-6 col-md-4 mb-3">
									<div>
										<strong>Conversion Rate (%)</strong>
									</div>
									<div>
										{conversionRate !== undefined ? (
											formatPercent(conversionRate)
										) : (
											<span className="text-muted">—</span>
										)}
									</div>
								</div>
								<div className="col-sm-6 col-md-4 mb-3">
									<div>
										<strong>Top Seller</strong>
									</div>
									<div>
										{topSeller ? (
											topSeller
										) : (
											<span className="text-muted">—</span>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			{error && <div className="alert alert-danger text-center">{error}</div>}
			{successMsg && (
				<div className="alert alert-success text-center">{successMsg}</div>
			)}
		</div>
	);
}

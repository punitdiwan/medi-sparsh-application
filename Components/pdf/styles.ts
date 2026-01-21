import { StyleSheet } from "@react-pdf/renderer";

export const pdfStyles = StyleSheet.create({
    page: {
        padding: 30,
        backgroundColor: "#fff",
        fontFamily: "Helvetica",
        fontSize: 11,
    },
    sectionBox: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 4,
        padding: 10,
        marginBottom: 12,
    },
    table: {
        borderWidth: 1,
        borderColor: "#aaa",
        marginTop: 8,
        marginBottom: 10,
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    tableHeader: {
        flex: 1,
        padding: 6,
        textAlign: "center",
        backgroundColor: "#f0f0f0",
        fontSize: 10,
        fontWeight: "bold",
    },
    tableCell: {
        flex: 1,
        padding: 6,
        fontSize: 10,
        textAlign: "center",
    },
    // Add other common styles here
});

export const headerStyles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        marginBottom: 10,
        backgroundColor: "#008C9E",
        color: "white",
    },
    headerFixed: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
    },
    hospitalName: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 1,
        textTransform: "uppercase",
    },
    doctorBlock: {
        textAlign: "right",
        maxWidth: 200,
    },
    doctorName: {
        fontSize: 14,
        fontWeight: "bold",
    },
    doctorSpecialization: {
        fontSize: 11,
        color: "#e0e0e0", // Slightly lighter for contrast on dark bg
    },
    headRow: {
        flexDirection: "row",
        marginBottom: 2,
    },
    headLabel: {
        fontWeight: "bold",
        marginRight: 4,
        width: 60,
    },
});

import ReactPDF, { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { WordType } from "../../types";
import { FetchFunction } from "../crud";
import { baseURLS } from "../enums";

const styles = StyleSheet.create({
  page: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#E4E4E4",
    border: "1 solid #000",
    paddingTop: 10,
    paddingBottom: 10,
  },
  section: {
    borderBottom: "1 solid #000",
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: "column",
    justifyContent: "space-between",
    display: "flex",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Times-Bold",
    fontWeight: 700,
  },
  headerDescription: {
    fontFamily: "Times-Bold",
    fontSize: 20,
    fontWeight: 700,
  },
  wordTitle: {
    fontFamily: "Times-Roman",
    fontSize: 16,
  },
  wordDescription: {
    fontFamily: "Times-Roman",
    fontSize: 16,
  },
});

export function MyDocument({ data }: { data: WordType[] }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {(data || []).map((word) => (
          <View key={word.id} style={styles.section}>
            <Text style={styles.headerTitle}>{word.title}</Text>
            <Text style={styles.wordDescription}>
              {word.translation} {word.description ? `- ${word.description}` : null}
            </Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function savePDF(title: string, parent_id: string) {
  const data = await FetchFunction({
    url: `${baseURLS.baseServer}/words`,
    method: "POST",
    body: JSON.stringify({ data: { parent_id } }),
  });

  const blob = await ReactPDF.pdf(<MyDocument data={data?.data || []} />).toBlob();
  const url = URL.createObjectURL(blob);
  const aTag = document.createElement("a");
  aTag.href = url;
  aTag.style.display = "none";
  aTag.download = `${title}.pdf`;
  document.body.appendChild(aTag);
  aTag.click();
  aTag.remove();
}

import { View } from "react-native";
import { Text, Button } from "react-native-paper";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text variant="bodyMedium">Edit app/index.tsx to edit this screen.</Text>
      <Button icon="hand-wave" mode="contained">
        Example button!
      </Button>
    </View>
  );
}

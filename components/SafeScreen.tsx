import { Platform, StatusBar, View, type ViewProps } from "react-native";

const TOP_INSET = Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 47;

type Props = ViewProps & { className?: string };

export function SafeScreen({ className, style, children, ...props }: Props) {
  return (
    <View className={className} style={[{ paddingTop: TOP_INSET }, style]} {...props}>
      {children}
    </View>
  );
}

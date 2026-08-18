import { Component, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("Uygulama hatası yakalandı:", error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <View className="flex-1 bg-background items-center justify-center px-8 gap-4">
          <Text className="text-foreground text-lg font-bold text-center">
            Bir şeyler ters gitti
          </Text>
          <Text className="text-muted text-sm text-center">
            Bu ekranda beklenmeyen bir hata oluştu. Tekrar denemek uygulamanın geri kalanını
            etkilemez.
          </Text>
          <Pressable onPress={this.reset} className="bg-accent rounded-full px-6 py-3 mt-2">
            <Text className="text-accent-ink font-semibold text-sm">Tekrar Dene</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

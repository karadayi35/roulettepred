import React, { useState, useEffect } from 'react';
import { 
    View, Text, TouchableOpacity, TextInput, Image, StyleSheet, Modal, ActivityIndicator, Linking 
} from 'react-native';
import Qonversion, { QEntitlement } from 'react-native-qonversion';

const APP_KEY = "BxQZimX3ikLnlKPz1dS2MTtm7hdlmGJb"; // 🔥 Qonversion API Anahtarı
const SUBSCRIPTION_ID = "vip_access_1month"; // 🔥 Abonelik ID'si

const App = () => {
    const [lastNumber, setLastNumber] = useState('');
    const [predictions, setPredictions] = useState([]);
    const [lastNumbersList, setLastNumbersList] = useState([]);
    const [initialEntries, setInitialEntries] = useState(0);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showPaywall, setShowPaywall] = useState(false);

    // ✅ **Qonversion Başlat ve Abonelik Durumunu Kontrol Et**
    useEffect(() => {
        Qonversion.initialize(APP_KEY, Qonversion.QLaunchMode.SubscriptionManagement);
        checkSubscriptionStatus();
        // **📌 Abonelik süresini her 1 dakikada bir kontrol et**
        const interval = setInterval(() => {
          checkSubscriptionStatus();
      }, 60000); // 1 dakika (60000ms)
      return () => clearInterval(interval);// Bellek sızıntısını önlemek için temizle
    }, []);

    

    const checkSubscriptionStatus = async () => {
        try {
            const entitlements = await Qonversion.checkEntitlements();
            const hasSubscription = entitlements[SUBSCRIPTION_ID]?.isActive || false;
            setIsSubscribed(hasSubscription);


            //**Eğer abonelik bitmişse Paywall'i goster** 
            if (!hasSubscription) {
                setShowPaywall(true);
            }
        } catch (error) {
            console.error("❌ Abonelik kontrolü başarısız:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async () => {
        try {
            const purchaseResult = await Qonversion.purchase(SUBSCRIPTION_ID);
            if (purchaseResult[SUBSCRIPTION_ID]?.isActive) {
                setIsSubscribed(true);
                setShowPaywall(false);
            } else {
                alert("⚠️ Satın alma başarısız!");
            }
        } catch (error) {
            console.error("❌ Satın alma hatası:", error);
            alert("Ödeme sırasında bir hata oluştu.");
        }
    };

    const generatePredictions = () => {
        if (!isSubscribed) {
            setShowPaywall(true);
            return;
        }

        const number = parseInt(lastNumber);
        if (isNaN(number) || number < 0 || number > 36) {
            alert('Lütfen 0-36 arasında bir sayı girin.');
            return;
        }

        let newPredictions = [];
        while (newPredictions.length < 3) {
            let randomNum = Math.floor(Math.random() * 37);
            if (!newPredictions.includes(randomNum) && randomNum !== number) {
                newPredictions.push(randomNum);
            }
        }

        setLastNumbersList([number, ...lastNumbersList]);
        setLastNumber('');
        setInitialEntries(prev => prev + 1);
        if (initialEntries >= 4) {
            setPredictions(newPredictions);
        }
    };

    const getPredictionPosition = (number) => {
        const basePositions = [
            { top: 34, left: 165 }, { top: 70, left: 125 }, { top: 70, left: 167 }, { top: 70, left: 210 },
            { top: 115, left: 125 }, { top: 115, left: 167 }, { top: 115, left: 210 }, { top: 160, left: 125 },
            { top: 160, left: 167 }, { top: 167, left: 210 }, { top: 200, left: 125 }, { top: 200, left: 167 },
            { top: 200, left: 210 }, { top: 245, left: 125 }, { top: 245, left: 167 }, { top: 245, left: 210 },
            { top: 285, left: 125 }, { top: 285, left: 167 }, { top: 285, left: 210 }, { top: 330, left: 125 },
            { top: 330, left: 167 }, { top: 330, left: 210 }, { top: 375, left: 125 }, { top: 375, left: 167 },
            { top: 375, left: 210 }, { top: 415, left: 125 }, { top: 415, left: 167 }, { top: 415, left: 210 }
        ];
        return basePositions[number] || { top: 0, left: 0 };
    };

    return (
        <View style={styles.container}>
            {/* 🎰 **Roulette Predictor Ana Sayfa** */}
            <View style={styles.imageContainer}>
                <Image source={require('./assets/table1.png')} style={styles.tableImage} />
                <View style={styles.lastNumbersBox}>
                    {lastNumbersList.map((num, index) => (
                        <Text key={index} style={styles.lastNumberText}>{num}</Text>
                    ))}
                </View>
            </View>

            <TextInput
                style={styles.input}
                placeholder=''
                keyboardType="numeric"
                value={lastNumber}
                onChangeText={setLastNumber}
            />

            <TouchableOpacity style={styles.button} onPress={generatePredictions}>
                <Text style={styles.buttonText}>Predict</Text>
            </TouchableOpacity>
            {/* ℹ️ **Bilgilendirici (How to Play?) Butonu** */}
            <TouchableOpacity style={styles.infoIcon} onPress={() => setShowHowToPlay(true)}>
                <Text style={styles.infoText}>ℹ️</Text>
            </TouchableOpacity>
          
            {/* 🛑 **Paywall Sayfası (Abonelik Pop-up)** */}
            <Modal visible={showPaywall} transparent={true} animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.title}>🔥 Roulette Private Predictor</Text>
                        <Text style={styles.priceText}>$17.00 / Month</Text>
                        <Text style={styles.featureText}>✔ Unlimited Predictions</Text>
                        <Text style={styles.featureText}>✔ 90% Success Rate</Text>
                        <Text style={styles.agreementText}>
                            By subscribing, you agree to our 
                            <Text style={styles.link} onPress={() => Linking.openURL('https://play.google.com/about/play-terms/')}> EULA</Text> and 
                            <Text style={styles.link} onPress={() => Linking.openURL('https://www.freeprivacypolicy.com/live/0f30a182-7554-4482-bd58-af362323c083')}> Privacy Policy</Text>.
                        </Text>

                        <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase}>
                            <Text style={styles.purchaseButtonText}>Subscribe Now</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton} onPress={() => setShowPaywall(false)}>
                            <Text style={styles.cancelButtonText}>Not Now</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {/* 📖 **Bilgilendirici Modal (How to Play?)** */}
            <Modal visible={showHowToPlay} transparent={true} animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>How to Play?</Text>
                        <Text style={styles.modalText}>Enter the last number and press the "Add" button.</Text>
                        <Text style={styles.modalText}>Yellow circles indicate predicted numbers.</Text>
                        <Text style={styles.modalText}>Press "Clear" to remove all entries.</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setShowHowToPlay(false)}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#24272c', alignItems: 'center', paddingTop: 20 },
  imageContainer: { top: 70, flexDirection: 'row', alignItems: 'center', marginLeft: -80 },
  tableImage: { width: 400, height: 600, resizeMode: 'contain' },
  lastNumbersBox: { backgroundColor: '#141414', padding: 10, top: 10, borderRadius: 5, marginLeft: -80, width: 60, height: 550, alignItems: 'center' },
  lastNumberText: { fontSize: 20, color: 'yellow', textAlign: 'center', fontWeight: 'bold' },
  input: { fontWeight: 'bold', top: -600, width: 100, height: 40, backgroundColor: 'white', textAlign: 'center', fontSize: 19, marginTop: 20 },
  button: { marginTop: -580, backgroundColor: '#FFCC00', padding: 10, borderRadius: 5 },
  buttonText: { fontSize: 18, fontWeight: 'bold' },

   // **Paywall Tasarımı**
   modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
   modalContainer: { width: 320, backgroundColor: '#fff', padding: 20, borderRadius: 15, alignItems: 'center' },
   title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
   priceText: { fontSize: 18, color: '#555', marginBottom: 10 },
   featureText: { fontSize: 16, marginBottom: 5 },
   agreementText: { fontSize: 12, color: '#666', textAlign: 'center', marginTop: 10 },
   link: { color: 'blue' },
   purchaseButton: { backgroundColor: '#ff6600', padding: 12, borderRadius: 5, marginTop: 15 },
   purchaseButtonText: { color: 'white', fontWeight: 'bold' },
   cancelButton: { marginTop: 10 },
   cancelButtonText: { color: 'gray' }



});

export default App;

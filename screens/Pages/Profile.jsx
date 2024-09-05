import {
  View,
  Platform,
  StatusBar,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { COLORS, TEXT } from "../../constants/theme";
import { AppBar, HeightSpacer, ReusableText } from "../../components";
import styles from "./pages.style";
import general from "../../components/general.style.js";
import ReusableSettings from "../../components/Reusable/ReusableSettings";
import { useDispatch, useSelector } from "react-redux";
import { logout, editProfile } from "../../redux/actions/userActions";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../config";
import * as ImagePicker from "expo-image-picker";
import NoticeMessage from "../../components/Reusable/NoticeMessage.jsx";
import { AntDesign, Ionicons } from "@expo/vector-icons";

const Profile = ({ navigation }) => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState(null);
  const [image, setImage] = useState(user?.picture);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert("Üzgünüz, galeri erişim izni gerekiyor!");
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (result && !result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      await uploadImage(uri);
    }
  };

  const uploadImage = async (uri) => {
    if (!uri) {
      return null;
    }
    const response = await fetch(uri);
    const blob = await response.blob();
    const date = new Date();
    const formattedDate = date.toISOString().split(".")[0].replace("T", "-");
    const filename = `${user.name}-${formattedDate}.jpg`;
    const storageRef = ref(storage, `ProfilePictures/${filename}`);
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    await updateProfilePicture(url);
    return url;
  };

  const updateProfilePicture = async (url) => {
    const actionResult = await dispatch(editProfile({ picture: url }));
    if (editProfile.fulfilled.match(actionResult)) {
      setStatus("success");
      setMessage("Profil resmi güncellendi");
    } else if (editProfile.rejected.match(actionResult)) {
      const NoticeMessage = actionResult.payload;
      setStatus("error");
      setMessage(NoticeMessage);
    }
    setTimeout(() => setStatus(null), 3000);
  };

  const logoutHandler = async () => {
    await dispatch(logout());
    navigation.navigate("CompanyLoginAgain");
  };

  return (
    <SafeAreaView
      style={[
        general.container,
        { paddingTop: Platform.OS === "ios" ? 20 : StatusBar.currentHeight },
      ]}
    >
      <View style={styles.header}>
        <AppBar
          top={20}
          left={20}
          right={20}
          color={COLORS.white}
          onPress={() => navigation.goBack()}
        />
      </View>
      <View style={{ paddingHorizontal: 25 }}>
        <ReusableText
          text={"Uygulama"}
          family={"regular"}
          size={TEXT.xLarge}
          color={COLORS.description}
        />
        <ReusableText
          text={"Ayarları"}
          family={"bold"}
          size={TEXT.xxLarge}
          color={COLORS.black}
        />
      </View>
      <HeightSpacer height={25} />
      <View style={styles.profile}>
        {/* Profile Image */}
        <TouchableOpacity style={{ position: "relative" }} onPress={pickImage}>
          <Image
            source={{
              uri: image
                ? image
                : "https://firebasestorage.googleapis.com/v0/b/projectxwire-e951a.appspot.com/o/user.png?alt=media&token=1beeeb68-a4c5-4a9c-b0e1-b3bd437a37fc",
            }}
            style={styles.image}
          />
          <View style={styles.editIcon}>
            <AntDesign name="edit" size={15} color="black" />
          </View>
        </TouchableOpacity>
        <HeightSpacer height={5} />
        <View style={styles.name}>
          <ReusableText
            text={user?.name ? `${user?.name}` : "Misafir"}
            family={"bold"}
            size={TEXT.medium}
            color={COLORS.black}
          />
          <ReusableText
            text={user?.email ? `${user?.email}` : "mail@misafir.com"}
            family={"regular"}
            size={TEXT.xSmall}
            color={COLORS.description}
          />
        </View>
      </View>
      <HeightSpacer height={30} />
      {!user ? null : (
        <>
          <View style={{ paddingHorizontal: 20, paddingBottom: 5 }}>
            <ReusableText
              text={"Genel"}
              family={"regular"}
              size={TEXT.small}
              color={COLORS.description}
            />
          </View>
          <View style={styles.settingsBox}>
            <ReusableSettings
              icon={"person-outline"}
              title={"Profili Düzenle"}
              onPress={() => navigation.navigate("ProfileEdit")}
            />
            <View
              style={{ borderTopWidth: 1, borderColor: COLORS.lightBorder }}
            />
            <ReusableSettings
              icon={"clipboard-outline"}
              title={"Projeyi Düzenle"}
              onPress={() => navigation.navigate("ProjectEdit")}
            />
          </View>
        </>
      )}
      <HeightSpacer height={30} />
      <View style={{ paddingHorizontal: 20, paddingBottom: 5 }}>
        <ReusableText
          text={"Politikalar ve Yardım"}
          family={"regular"}
          size={TEXT.small}
          color={COLORS.description}
        />
      </View>
      <View style={styles.settingsBox}>
        <ReusableSettings
          icon={"notifications-outline"}
          title={"Bildirimler"}
          onPress={() => navigation.navigate("Notification")}
        />
        <View style={{ borderTopWidth: 1, borderColor: COLORS.lightBorder }} />
        <ReusableSettings
          icon={"trail-sign-outline"}
          title={"Yardım ve Destek"}
          onPress={() => navigation.navigate("Helpers")}
        />
        <View style={{ borderTopWidth: 1, borderColor: COLORS.lightBorder }} />
        <ReusableSettings
          icon={"clipboard-outline"}
          title={"Politikalar ve Gizlilik"}
          onPress={() => navigation.navigate("Politicy")}
        />
      </View>
      <HeightSpacer height={40} />
      {!user ? (
        <View style={styles.settingsBox}>
          <ReusableSettings
            icon={"log-in-outline"}
            title={"Giriş Yap"}
            onPress={() => navigation.navigate("Login")}
          />
        </View>
      ) : (
        <View style={styles.settingsBox}>
          <ReusableSettings
            icon={"log-out-outline"}
            title={"Çıkış Yap"}
            onPress={logoutHandler}
          />
        </View>
      )}
      {status && <NoticeMessage status={status} message={message} />}
    </SafeAreaView>
  );
};

export default Profile;

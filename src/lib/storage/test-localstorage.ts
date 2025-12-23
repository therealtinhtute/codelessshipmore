import { LocalStorageProvider } from "./local-storage-provider"

// Simple test script to verify localStorage operations
export async function testLocalStorage() {
  console.log("Testing localStorage operations...")

  const storage = LocalStorageProvider.getInstance()

  if (!storage.isAvailable()) {
    console.error("❌ localStorage is not available")
    return false
  }

  console.log("✅ localStorage is available")

  try {
    // Test profile creation
    const profile = await storage.createProfile({
      name: "Test Profile",
      description: "Test profile for localStorage verification"
    })
    console.log("✅ Created profile:", profile.name)

    // Test profile retrieval
    const retrievedProfile = await storage.getProfile(profile.id)
    if (retrievedProfile && retrievedProfile.name === "Test Profile") {
      console.log("✅ Profile retrieval works")
    } else {
      console.error("❌ Profile retrieval failed")
      return false
    }

    // Test profile update
    const updatedProfile = await storage.updateProfile(profile.id, {
      name: "Updated Test Profile"
    })
    if (updatedProfile.name === "Updated Test Profile") {
      console.log("✅ Profile update works")
    } else {
      console.error("❌ Profile update failed")
      return false
    }

    // Test provider config
    await storage.saveProviderConfig({
      profileId: profile.id,
      providerId: "openai" as any,
      providerType: "builtin",
      apiKey: null,
      model: "gpt-4",
      baseUrl: undefined,
      enabled: false
    })
    console.log("✅ Provider config saved")

    // Test provider retrieval
    const providers = await storage.getProviderConfigsByProfile(profile.id)
    if (providers.length === 1) {
      console.log("✅ Provider config retrieval works")
    } else {
      console.error("❌ Provider config retrieval failed")
      return false
    }

    // Test metadata
    await storage.setMetadata("test_key", "test_value")
    const metadata = await storage.getMetadata("test_key")
    if (metadata === "test_value") {
      console.log("✅ Metadata operations work")
    } else {
      console.error("❌ Metadata operations failed")
      return false
    }

    // Cleanup
    await storage.deleteProfile(profile.id)
    console.log("✅ Cleanup completed")

    console.log("🎉 All localStorage operations work correctly!")
    return true
  } catch (error) {
    console.error("❌ localStorage test failed:", error)
    return false
  }
}
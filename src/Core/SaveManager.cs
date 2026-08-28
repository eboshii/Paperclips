using System;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Paperclips.Core
{
    public class SaveManager
    {
        public const string CurrentSchemaVersion = "1.0.0";
        private const string SaltKey = "ObjectivePaperclips_EntropySecret_2026";

        [Serializable]
        public class SavePayload
        {
            public string Version { get; set; } = CurrentSchemaVersion;
            public string GameStateJson { get; set; }
            public string ChecksumSha256 { get; set; }
            public long SaveUnixTimestamp { get; set; }
        }

        public static string SerializeSave(GameState state)
        {
            state.LastSaveTimestampUnix = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            string json = JsonSerializer.Serialize(state, new JsonSerializerOptions { WriteIndented = false });
            string hash = ComputeHash(json);

            var payload = new SavePayload
            {
                Version = CurrentSchemaVersion,
                GameStateJson = json,
                ChecksumSha256 = hash,
                SaveUnixTimestamp = state.LastSaveTimestampUnix
            };

            return JsonSerializer.Serialize(payload, new JsonSerializerOptions { WriteIndented = true });
        }

        public static string ExportToBase64(GameState state)
        {
            string jsonSave = SerializeSave(state);
            byte[] bytes = Encoding.UTF8.GetBytes(jsonSave);
            return Convert.ToBase64String(bytes);
        }

        public static GameState ImportFromBase64(string base64String, out bool isTampered)
        {
            isTampered = false;
            try
            {
                byte[] bytes = Convert.FromBase64String(base64String.Trim());
                string json = Encoding.UTF8.GetString(bytes);
                return DeserializeSave(json, out isTampered);
            }
            catch
            {
                isTampered = true;
                return new GameState();
            }
        }

        public static GameState DeserializeSave(string payloadJson, out bool isTampered)
        {
            isTampered = false;
            try
            {
                var payload = JsonSerializer.Deserialize<SavePayload>(payloadJson);
                if (payload == null || string.IsNullOrEmpty(payload.GameStateJson))
                {
                    return new GameState();
                }

                // Checksum integrity check
                string computed = ComputeHash(payload.GameStateJson);
                if (!string.Equals(computed, payload.ChecksumSha256, StringComparison.OrdinalIgnoreCase))
                {
                    isTampered = true;
                }

                var state = JsonSerializer.Deserialize<GameState>(payload.GameStateJson);
                return state ?? new GameState();
            }
            catch
            {
                isTampered = true;
                return new GameState();
            }
        }

        private static string ComputeHash(string rawJson)
        {
            using var sha = SHA256.Create();
            byte[] bytes = Encoding.UTF8.GetBytes(rawJson + SaltKey);
            byte[] hash = sha.ComputeHash(bytes);
            return Convert.ToHexString(hash);
        }
    }
}

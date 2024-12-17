import express from "express";

const app = express();
const port = process.env.MOCK_TIKTOK_PORT || 443;

// Utility function to generate random IDs (replacing the external generateId import)
function generateId(length: number = 24): string {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Helper function to generate realistic metrics
function generateMetrics(requestedMetrics: string[]) {
  const metrics: Record<string, string> = {};

  // Base values for different metrics with realistic ratios
  const baseValues = {
    impressions: { min: 1000, max: 100000 },
    clicks: { min: 50, max: 5000 },
    spend: { min: 100, max: 10000 },
    video_watched_2s: { min: 800, max: 80000 },
    video_views_p75: { min: 200, max: 20000 },
    conversion: { min: 10, max: 1000 },
    video_play_actions: { min: 500, max: 50000 },
    video_watched_6s: { min: 400, max: 40000 },
    average_video_play: { min: 3, max: 15 },
    video_views_p25: { min: 600, max: 60000 },
    video_views_p50: { min: 400, max: 40000 },
    video_views_p100: { min: 100, max: 10000 },
  };

  // Generate values for requested metrics
  requestedMetrics.forEach((metric) => {
    if (baseValues[metric as keyof typeof baseValues]) {
      const { min, max } = baseValues[metric as keyof typeof baseValues];
      metrics[metric] = Math.floor(
        Math.random() * (max - min) + min
      ).toString();
    } else {
      metrics[metric] = "0"; // Default value for unknown metrics
    }
  });

  return metrics;
}

// Helper function to generate a list of mock data
function generateMockData(
  materialIds: string[],
  infoFields: string[],
  metricsFields: string[]
) {
  // Generate one response for each material ID
  return materialIds.map((materialId) => {
    return {
      metrics: generateMetrics(metricsFields),
      info: {
        material_id: materialId,
        video_id: generateId(24),
        page_id: generateId(24),
        image_id: generateId(24),
        ...infoFields.reduce((acc, field) => {
          if (
            !["material_id", "video_id", "page_id", "image_id"].includes(field)
          ) {
            acc[field] = generateId(24);
          }
          return acc;
        }, {} as Record<string, any>),
      },
    };
  });
}

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Access-Token"
  );
  next();
});

// Add logging middleware for all requests
app.use((req, res, next) => {
  console.log("\n=== Incoming Request ===");
  console.log(`${new Date().toISOString()}`);
  console.log(`Method: ${req.method}`);
  console.log(`Path: ${req.path}`);
  console.log("Headers:", req.headers);
  console.log("Query Parameters:", req.query);
  console.log("======================\n");
  next();
});

// Main endpoint that mimics TikTok's creative report API
app.get("/open_api/v1.3/creative/report/get", (req, res) => {
  console.log("\n=== Processing Creative Report Request ===");
  console.log("Raw query parameters:", req.query);

  const {
    advertiser_id,
    material_type,
    lifetime,
    start_date,
    end_date,
    info_fields,
    metrics_fields,
    page = "1",
    page_size = "10",
    filtering,
  } = req.query;

  console.log("Advertiser ID:", advertiser_id);
  console.log("Material Type:", material_type);
  console.log("Lifetime:", lifetime);
  console.log("Info Fields:", info_fields);
  console.log("Metrics Fields:", metrics_fields);

  try {
    // Parse fields
    const parsedInfoFields = JSON.parse(info_fields as string);
    const parsedMetricsFields = JSON.parse(metrics_fields as string);

    console.log("Parsed Info Fields:", parsedInfoFields);
    console.log("Parsed Metrics Fields:", parsedMetricsFields);

    // Get material_ids from filtering
    let materialIds: string[] = [];
    if (filtering) {
      const parsedFiltering = JSON.parse(filtering as string);
      if (
        parsedFiltering.material_id &&
        Array.isArray(parsedFiltering.material_id)
      ) {
        materialIds = parsedFiltering.material_id;
        console.log("Using material IDs from request:", materialIds);
      } else {
        throw new Error(
          "material_id must be provided as an array in the filtering parameter"
        );
      }
    } else {
      throw new Error("filtering parameter with material_id array is required");
    }

    // Generate mock data for each material ID
    const mockData = generateMockData(
      materialIds,
      parsedInfoFields,
      parsedMetricsFields
    );

    // Construct response
    const response = {
      code: 0,
      message: "OK",
      request_id: generateId(32),
      data: {
        list: mockData,
        page_info: {
          total_number: materialIds.length,
          total_page: 1,
          page_size: materialIds.length,
          page: 1,
        },
      },
    };

    console.log("\n=== Sending Response ===");
    console.log("Response Data:", JSON.stringify(response, null, 2));
    console.log("\nMetrics Details:");
    response.data.list.forEach((item, index) => {
      console.log(`\nItem ${index + 1}:`);
      console.log("Material ID:", item.info.material_id);
      console.log("Video ID:", item.info.video_id);
      console.log("Metrics:", JSON.stringify(item.metrics, null, 2));
    });
    console.log("========================\n");

    res.json(response);
  } catch (error) {
    console.error("\n=== Error Processing Request ===");
    console.error("Error:", error);
    console.error("=============================\n");
    res.status(400).json({
      code: 40001,
      message:
        error instanceof Error ? error.message : "Invalid request parameters",
      request_id: generateId(32),
      data: {},
    });
  }
});

app.listen(port, () => {
  console.log(`Mock TikTok API server running at http://localhost:${port}`);
  console.log(
    `Ready to handle creative report requests at /open_api/v1.3/creative/report/get`
  );
});

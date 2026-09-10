const {createClient} = require("@supabase/supabase-js");
const dotenv = require("dotenv");
// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
// const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
const supabase = require('../../db/supabase_connect');
dotenv.config();

async function slot(req, res) {
  try {
    const date = req.body?.date || req.query?.date;
    const crop_type = req.body?.crop_type || req.query?.crop_type;
    const pincode = req.body?.pincode || req.query?.pincode;

    if (!date  || !crop_type || !pincode) {
      return res.status(400).json({
        message: "pincode, date and crop_type are required",
        success: false,
      });
    }

    // Format crop_type for array matching
    const formattedCrop = crop_type.charAt(0).toUpperCase() + crop_type.slice(1).toLowerCase();

    // Searching nearby procurement centers based on pincode and active status
    let { data, error } = await supabase
      .from("procurement_centres")
      .select("centrecode, address, district")
      .eq("pincode", pincode)
      .eq("status", "active")
      .contains("crop_available", [formattedCrop]);

    // If no exact match with formatted crop, try lowercase or all active centers for this pincode
    if (!data || data.length === 0) {
      const fallback = await supabase
        .from("procurement_centres")
        .select("centrecode, address, district")
        .eq("pincode", pincode)
        .eq("status", "active");
      if (fallback.data && fallback.data.length > 0) {
        data = fallback.data;
      }
    }

    if (error && (!data || data.length === 0)) {
      return res.status(500).json({
        message: "Error fetching procurement centers",
        success: false,
        error: error.message,
      });
    }

    res.status(200).json({
      message: "Procurement centers fetched successfully",
      success: true,
      data: data || [],
    });
  } catch (e) {
    console.log("Error in slot controller", e);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: e.message,
    });
  }
}

async function check_availability(req, res) {
  try {
    const centercode = req.body?.centercode || req.query?.centercode;
    const date = req.body?.date || req.query?.date;
    const session = req.body?.session || req.query?.session;
    const crop_type = req.body?.crop_type || req.query?.crop_type || req.body?.croptype || req.query?.croptype;
    const qtyrange = req.body?.qtyrange || req.query?.qtyrange;

    // 1. Validate required fields
    if (!centercode || !date || !session || !qtyrange) {
      return res.status(400).json({
        message: "centercode, date, session and qtyrange are required",
        success: false,
      });
    }

    // Check if authenticated farmer already has an active booked slot
    const farmerId = req.farmer?.farmerID || req.farmer?._id?.toString();
    if (farmerId) {
      const { data: activePass } = await supabase
        .from("procurements")
        .select("procurement_id, slot_date, slot_time")
        .eq("farmer_id", farmerId)
        .neq("status", "cancelled")
        .limit(1);

      if (activePass && activePass.length > 0) {
        return res.status(200).json({
          success: true,
          message: `You already have an active Gate Pass scheduled for ${activePass[0].slot_date} (${activePass[0].slot_time}).`,
          data: {
            canBook: false,
            alreadyBooked: true,
            activeBooking: activePass[0],
            session: session,
            note: "Existing active gate pass must be completed or cancelled before booking another slot.",
          },
        });
      }
    }

    // 2. Parse quantity range (convert strings to numbers)
    const [minQtyStr, maxQtyStr] = qtyrange.split("-");
    const minQty = parseFloat(minQtyStr);
    const maxQty = parseFloat(maxQtyStr);

    if (isNaN(minQty) || isNaN(maxQty)) {
      return res.status(400).json({
        message: "Invalid qtyrange format. Use 'min-max' (e.g., '2.5-3.0')",
        success: false,
      });
    }

    // 3. Fetch from Supabase with flexible crop case
    const formattedCrop = crop_type ? (crop_type.charAt(0).toUpperCase() + crop_type.slice(1).toLowerCase()) : null;

    let query = supabase
      .from("center_slots")
      .select("slots")
      .eq("center_code", centercode)
      .eq("date", date);

    if (formattedCrop) {
      query = query.or(`crop_available.eq.${formattedCrop},crop_available.eq.${crop_type.toLowerCase()}`);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({
        message: "Error fetching availability",
        success: false,
        error: error.message,
      });
    }

    // 4. Extract slots or use standard open slots if not yet configured in DB
    const DEFAULT_SLOTS = {
      "08:00-10:00": { available: 50, booked: 0, popularity: 0.5 },
      "10:00-12:00": { available: 50, booked: 0, popularity: 0.5 },
      "12:30-2:30": { available: 50, booked: 0, popularity: 0.5 },
      "2:30-4:30": { available: 50, booked: 0, popularity: 0.5 },
      "4:30-6:00": { available: 50, booked: 0, popularity: 0.5 },
    };

    let slots = DEFAULT_SLOTS;
    if (data && data.length > 0 && data[0]?.slots) {
      slots = data[0].slots.slots || data[0].slots;
    }

    // 5. Define which slots belong to the session
    const sessionSlotKeys =
      session === "morning"
        ? ["08:00-10:00", "10:00-12:00"]
        : ["12:30-2:30", "2:30-4:30", "4:30-6:00"];

    // 6. Apply 10% buffer and check each slot INDIVIDUALLY
    const BUFFER_PERCENT = 0.1;
    let canBook = false;

    for (const key of sessionSlotKeys) {
      const slot = slots[key];
      if (!slot) continue; // Skip if slot doesn't exist

      // Calculate effective available space after reserving 10% buffer
      const totalCapacity = slot.available + slot.booked;
      const bufferReserve = totalCapacity * BUFFER_PERCENT;
      const effectiveAvailable = slot.available - bufferReserve;

      // If ANY single slot can fit the farmer's MAX quantity → canBook = true
      if (effectiveAvailable >= maxQty) {
        canBook = true;
        break; // No need to check further
      }
    }

    // 8. Return the simple boolean response
    return res.status(200).json({
      success: true,
      message: canBook
        ? `You can book in ${session}.`
        : `${session.charAt(0).toUpperCase() + session.slice(1)} is full for your quantity (${maxQty} tons).`,
      data: {
        canBook: canBook,
        session: session,
        farmerMaxQty: maxQty,
        note: "10% buffer is reserved in each slot for weighing errors.",
      },
    });
  } catch (error) {
    console.error("Check Availability Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
}

  // ============================================================
  // 1. CONFIG & CONSTANTS
  // ============================================================

  const BUFFER_PERCENT = 0.1;
  const SMALL_MAX = 0.5; // tons
  const MEDIUM_MAX = 2.0; // tons
  const ALL_SLOT_KEYS = [
    "08:00-10:00",
    "10:00-12:00",
    "12:30-2:30",
    "2:30-4:30",
    "4:30-6:00",
  ];
  const SESSION_SLOTS = {
    morning: ["08:00-10:00", "10:00-12:00"],
    afternoon: ["12:30-2:30", "2:30-4:30", "4:30-6:00"],
  };

  const WEIGHTS = {
    small: { alpha: 0.7, beta: 0.3, crowdMultiplier: 1.0 },
    medium: { alpha: 0.6, beta: 0.4, crowdMultiplier: 1.5 },
    large: { alpha: 0.4, beta: 0.6, crowdMultiplier: 2.5 },
  };

  // ============================================================
  // 2. HELPER FUNCTIONS
  // ============================================================

  function classifyFarmer(avgQty) {
    if (avgQty <= SMALL_MAX) return "small";
    if (avgQty <= MEDIUM_MAX) return "medium";
    return "large";
  }

  function getEffectiveAvailable(slot) {
    return slot.available * (1 - BUFFER_PERCENT);
  }

  /**
   * Maps numeric quantity (in tons) to the ENUM procurement_quantity.
   * ENUM values: '<50', '50-80', '80-100', '>100' (in quintals).
   * 1 ton = 10 quintals.
   */
  function getQuantityEnum(maxQtyInTons) {
    const maxQtyInQuintals = maxQtyInTons * 10;
    if (maxQtyInQuintals < 50) return "<50";
    if (maxQtyInQuintals <= 80) return "50-80";
    if (maxQtyInQuintals <= 100) return "80-100";
    return ">100";
  }

  /**
   * Unified cost score — lower is better.
   * Both terms are normalized to a 0–100 scale.
   */
  function calculateScore(slotId, avgQty, farmerClass, allSlots) {
    const weights = WEIGHTS[farmerClass];
    const slot = allSlots[slotId];
    const capacity = slot.available + slot.booked || 1;
    const popularity = slot.popularity ?? 0.5;

    const idx = ALL_SLOT_KEYS.indexOf(slotId);
    const projectedLoad = slot.booked + avgQty;

    const leftBooked = allSlots[ALL_SLOT_KEYS[idx - 1]]?.booked;
    const rightBooked = allSlots[ALL_SLOT_KEYS[idx + 1]]?.booked;

    let loadBalance;
    if (leftBooked === undefined) {
      loadBalance = Math.abs(projectedLoad - rightBooked);
    } else if (rightBooked === undefined) {
      loadBalance = Math.abs(leftBooked - projectedLoad);
    } else {
      loadBalance =
        (Math.abs(leftBooked - projectedLoad) +
          Math.abs(projectedLoad - rightBooked)) /
        2;
    }

    const loadBalancePct = (loadBalance / capacity) * 100;

    const crowdPenalty =
      Math.min(popularity * weights.crowdMultiplier, 1) * 100;

    return weights.alpha * loadBalancePct + weights.beta * crowdPenalty;
  }

  // ============================================================
  // 3. THE MAIN BOOK ENDPOINT
  // ============================================================

async function book(req, res) {
    try {
      const { farmer_id: bodyFarmerId, centercode, date, session, croptype, qtyrange } =
        req.body;

      // Extract farmer identifier from authenticated farmer (attached by authMiddleware) or fallback to body
      const farmer_id = req.farmer?.farmerID || req.farmer?._id?.toString() || bodyFarmerId || null;

      // --- 1. Validation ---
      if (!centercode || !date || !session || !qtyrange || !croptype) {
        return res.status(400).json({
          message:
            "centercode, date, session, croptype and qtyrange are required",
          success: false,
        });
      }

      // --- 1.1 Prevent booking if farmer already has an active slot ---
      if (farmer_id) {
        const { data: activePass, error: passError } = await supabase
          .from("procurements")
          .select("procurement_id, slot_date, slot_time, token, status")
          .eq("farmer_id", farmer_id)
          .neq("status", "cancelled")
          .limit(1);

        if (activePass && activePass.length > 0) {
          const active = activePass[0];
          return res.status(409).json({
            success: false,
            canBook: false,
            alreadyBooked: true,
            message: `You already have an active Gate Pass scheduled for ${active.slot_date} (${active.slot_time}). You cannot book another slot while this pass is active. Please cancel your existing booking first.`,
            activeBooking: active,
          });
        }
      }

      // --- 2. Parse & validate quantity range ---
      const [minQtyStr, maxQtyStr] = qtyrange.split("-");
      const minQty = parseFloat(minQtyStr);
      const maxQty = parseFloat(maxQtyStr);
      const avgQty = (minQty + maxQty) / 2;
      console.log("PARSED VALUES:", { qtyrange, minQty, maxQty, avgQty }); // add this line
      if (isNaN(minQty) || isNaN(maxQty) || minQty <= 0 || maxQty <= 0) {
        return res.status(400).json({
          message: "Invalid qtyrange. Use 'min-max' (e.g., '2.5-3.0')",
          success: false,
        });
      }
      if (minQty > maxQty) {
        return res.status(400).json({
          message: "qtyrange minimum cannot be greater than maximum",
          success: false,
        });
      }

      // --- 3. Fetch current slot data (read-only — used for scoring/ranking only) ---
      const formattedCrop = croptype.charAt(0).toUpperCase() + croptype.slice(1).toLowerCase();
      const { data, error } = await supabase
        .from("center_slots")
        .select("slots")
        .eq("center_code", centercode)
        .eq("date", date)
        .or(`crop_available.eq.${formattedCrop},crop_available.eq.${croptype.toLowerCase()}`);
       console.log("BOOK - Query result data:", JSON.stringify(data, null, 2));
       if (data && data.length > 0) {
         console.log("BOOK - record:", JSON.stringify(data[0], null, 2));
         console.log("BOOK - slots type:", typeof data[0].slots);
         console.log("BOOK - slots keys:", Object.keys(data[0].slots || {}));
       }
      if (error) {
        return res.status(500).json({
          message: "Error fetching slot data",
          success: false,
          error: error.message,
        });
      }
      if (!data || data.length === 0) {
        const initialSlots = {
          "08:00-10:00": { available: 50, booked: 0, popularity: 0.5 },
          "10:00-12:00": { available: 50, booked: 0, popularity: 0.5 },
          "12:30-2:30": { available: 50, booked: 0, popularity: 0.5 },
          "2:30-4:30": { available: 50, booked: 0, popularity: 0.5 },
          "4:30-6:00": { available: 50, booked: 0, popularity: 0.5 },
        };

        const { data: inserted } = await supabase
          .from("center_slots")
          .insert({
            center_code: centercode,
            crop_available: formattedCrop,
            date: date,
            slots: initialSlots,
          })
          .select("slots");

        if (inserted && inserted.length > 0) {
          data = inserted;
        } else {
          data = [{ slots: initialSlots }];
        }
      }

      const slots = data[0].slots?.slots || data[0].slots || {};

      // --- 4. Candidate slots for the requested session ---
      const sessionSlotKeys = SESSION_SLOTS[session];
      if (!sessionSlotKeys) {
        return res.status(400).json({
          message: "Invalid session. Use 'morning' or 'afternoon'.",
          success: false,
        });
      }

      // --- 5. Filter slots that can fit this farmer (respecting the 10% buffer) ---
      const farmerClass = classifyFarmer(avgQty);
      const eligibleSlotIds = sessionSlotKeys.filter((key) => {
        const slot = slots[key];
        return slot && getEffectiveAvailable(slot) >= maxQty;
      });

      if (eligibleSlotIds.length === 0) {
        return res.status(409).json({
          success: false,
          canBook: false,
          message: `${session.charAt(0).toUpperCase() + session.slice(1)} is full for your quantity (${maxQty} tons). Please choose the other session or reduce your estimate.`,
        });
      }

      // --- 6. Score & rank candidates, best (lowest score) first ---
      const ranked = eligibleSlotIds
        .map((slotId) => ({
          slotId,
          score: calculateScore(slotId, avgQty, farmerClass, slots),
        }))
        .sort((a, b) => a.score - b.score);

      const scoreBreakdown = Object.fromEntries(
        ranked.map((r) => [r.slotId, parseFloat(r.score.toFixed(2))]),
      );

      // --- 7. Reserve via atomic RPC, falling back to next best on conflict ---
      let booked = null;
      let lastFailureReason = null;

      // Map numeric maxQty to the ENUM string for the database
      const qtyEnum = getQuantityEnum(maxQty);

      for (const candidate of ranked) {
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          "reserve_slot_and_book",
          {
            p_center_code: centercode,
            p_date: date,
            p_crop_type: croptype,
            p_slot_id: candidate.slotId,
            p_qty: maxQty, // numeric tons (for capacity update)
            p_qty_enum: qtyEnum, // ENUM string (for procurements.quantity)
            p_farmer_id: farmer_id || null,
            p_qty_min: minQty,
            p_qty_max: maxQty,
            p_qty_avg: avgQty,
            p_farmer_class: farmerClass,
            p_assigned_score: candidate.score, // store the final score
          },
        );

        if (rpcError) {
          lastFailureReason = rpcError.message;
          continue;
        }
        if (rpcData?.success) {
          booked = {
            slotId: candidate.slotId,
            token: rpcData.token,
            updatedSlot: rpcData.slots[candidate.slotId],
          };
          break;
        }
        lastFailureReason = rpcData?.reason || "unknown";
      }

      if (!booked) {
        return res.status(409).json({
          success: false,
          canBook: false,
          message: "All eligible slots filled up just now — please try again.",
          reason: lastFailureReason,
        });
      }

      // --- 8. Return success response ---
      return res.status(200).json({
        success: true,
        message: `✅ Booking confirmed for ${booked.slotId}!`,
        data: {
          farmerId: farmer_id || "GUEST",
          centerCode: centercode,
          date,
          crop: croptype,
          assignedSlot: booked.slotId,
          token: booked.token,
          farmerClass,
          estimatedQty: parseFloat(avgQty.toFixed(2)),
          reservedQty: parseFloat(maxQty.toFixed(2)),
          quantityRangeEnum: qtyEnum, // show the farmer what ENUM was stored
          scoreBreakdown,
          bestScore: parseFloat(ranked[0].score.toFixed(2)),
          updatedSlotCapacity: {
            available: parseFloat(booked.updatedSlot.available.toFixed(2)),
            booked: parseFloat(booked.updatedSlot.booked.toFixed(2)),
          },
          note: "10% buffer is reserved in each slot for weighing errors.",
        },
      });
    } catch (error) {
      console.error("Booking Error:", error);
      return res.status(500).json({
        message: "Internal server error",
        success: false,
        error: error.message,
      });
    }
}

async function get_active_pass(req, res) {
  try {
    const farmerId = req.farmer?.farmerID || req.farmer?._id?.toString();
    if (!farmerId) {
      return res.status(400).json({
        success: false,
        message: "Farmer identity not found",
      });
    }

    const { data, error } = await supabase
      .from("procurements")
      .select("*, procurement_centres(address, district)")
      .eq("farmer_id", farmerId)
      .neq("status", "cancelled")
      .order("procurement_id", { ascending: false })
      .limit(1);

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    if (!data || data.length === 0) {
      return res.status(200).json({
        success: true,
        booking: null,
      });
    }

    const b = data[0];
    return res.status(200).json({
      success: true,
      booking: {
        procurement_id: b.procurement_id,
        farmer_id: b.farmer_id,
        centreCode: b.centre_code,
        centreName: b.procurement_centres?.address || b.centre_code,
        district: b.procurement_centres?.district,
        date: b.slot_date,
        assignedSlot: b.slot_time,
        crop: b.crop,
        token: b.token || `GATE-PASS-${b.procurement_id}`,
        queuePosition: b.queue_position,
        status: b.status,
      },
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.message,
    });
  }
}

async function cancel_booking(req, res) {
  try {
    const farmerId = req.farmer?.farmerID || req.farmer?._id?.toString();
    const procurementId = req.body?.procurement_id;

    if (!farmerId) {
      return res.status(400).json({
        success: false,
        message: "Farmer identity not found",
      });
    }

    let query = supabase.from("procurements").update({ status: "cancelled" });

    if (procurementId) {
      query = query.eq("procurement_id", procurementId).eq("farmer_id", farmerId);
    } else {
      query = query.eq("farmer_id", farmerId).neq("status", "cancelled");
    }

    const { data, error } = await query.select();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Error cancelling slot booking",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Slot booking cancelled successfully.",
      data,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: e.message,
    });
  }
}

module.exports = { slot, check_availability, book, get_active_pass, cancel_booking };

package com.ekommerce.util;

import java.util.HashMap;
import java.util.Map;

public class ResponseUtil {

    public static Map<String, Object> success(String message) {
        Map<String, Object> m = new HashMap<>();
        m.put("success", true);
        m.put("message", message);
        return m;
    }

    public static Map<String, Object> error(String message) {
        Map<String, Object> m = new HashMap<>();
        m.put("success", false);
        m.put("error", message);
        return m;
    }
}

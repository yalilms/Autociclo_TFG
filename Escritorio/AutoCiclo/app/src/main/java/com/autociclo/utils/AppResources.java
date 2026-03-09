package com.autociclo.utils;

import javafx.scene.image.Image;

/**
 * Singleton para gestionar recursos compartidos de la aplicación.
 * Evita cargar el mismo recurso múltiples veces.
 *
 * @author Yalil Musa Talhaoui
 */
public final class AppResources {

    private static AppResources instance;

    private final Image appIcon;

    private AppResources() {
        this.appIcon = new Image(getClass().getResourceAsStream(AppConstants.PATH_APP_ICON));
    }

    public static synchronized AppResources getInstance() {
        if (instance == null) {
            instance = new AppResources();
        }
        return instance;
    }

    /**
     * Obtiene el icono de la aplicación (cargado una sola vez)
     */
    public Image getAppIcon() {
        return appIcon;
    }

    /**
     * Método estático de conveniencia para obtener el icono
     */
    public static Image getIcon() {
        return getInstance().getAppIcon();
    }
}

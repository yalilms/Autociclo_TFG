package com.autociclo.utils;

import javafx.animation.FadeTransition;
import javafx.animation.PauseTransition;
import javafx.animation.ScaleTransition;
import javafx.scene.Node;
import javafx.util.Duration;

/**
 * Factory para crear animaciones reutilizables.
 *
 * @author Yalil Musa Talhaoui
 */
public final class AnimationFactory {

    private AnimationFactory() {} // No instanciable

    /**
     * Crea una transición de fade (opacidad)
     */
    public static FadeTransition createFade(Node node, double fromValue, double toValue, double durationMs) {
        FadeTransition fade = new FadeTransition(Duration.millis(durationMs), node);
        fade.setFromValue(fromValue);
        fade.setToValue(toValue);
        return fade;
    }

    /**
     * Crea un fade-in estándar
     */
    public static FadeTransition createFadeIn(Node node) {
        return createFade(node, 0.0, 1.0, AppConstants.FADE_DURATION_MS);
    }

    /**
     * Crea un fade-out estándar
     */
    public static FadeTransition createFadeOut(Node node) {
        return createFade(node, 1.0, 0.0, AppConstants.FADE_DURATION_MS);
    }

    /**
     * Crea un fade rápido (para paginación)
     */
    public static FadeTransition createFadeFast(Node node, double from, double to) {
        return createFade(node, from, to, AppConstants.FADE_FAST_MS);
    }

    /**
     * Crea una transición de escala
     */
    public static ScaleTransition createScale(Node node, double fromScale, double toScale, double durationMs) {
        ScaleTransition scale = new ScaleTransition(Duration.millis(durationMs), node);
        scale.setFromX(fromScale);
        scale.setFromY(fromScale);
        scale.setToX(toScale);
        scale.setToY(toScale);
        return scale;
    }

    /**
     * Crea una escala rápida (para paginación)
     */
    public static ScaleTransition createScaleFast(Node node, double from, double to) {
        return createScale(node, from, to, AppConstants.SCALE_DURATION_MS);
    }

    /**
     * Crea una pausa
     */
    public static PauseTransition createPause(double durationSeconds) {
        return new PauseTransition(Duration.seconds(durationSeconds));
    }

    /**
     * Aplica fade-in a un nodo y lo ejecuta
     */
    public static void playFadeIn(Node node) {
        createFadeIn(node).play();
    }

    /**
     * Aplica fade-out a un nodo y lo ejecuta
     */
    public static void playFadeOut(Node node) {
        createFadeOut(node).play();
    }

    /**
     * Animación de cambio de página (fade + scale)
     */
    public static void playPageChangeAnimation(Node node, Runnable onFinished) {
        FadeTransition fadeOut = createFadeFast(node, 1.0, 0.3);
        FadeTransition fadeIn = createFadeFast(node, 0.3, 1.0);
        ScaleTransition scaleOut = createScaleFast(node, 1.0, 0.95);
        ScaleTransition scaleIn = createScaleFast(node, 0.95, 1.0);

        fadeOut.setOnFinished(e -> fadeIn.play());
        scaleOut.setOnFinished(e -> {
            scaleIn.play();
            if (onFinished != null) onFinished.run();
        });

        fadeOut.play();
        scaleOut.play();
    }
}

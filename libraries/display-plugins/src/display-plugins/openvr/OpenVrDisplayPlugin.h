//
//  Created by Bradley Austin Davis on 2015/06/12
//  Copyright 2015 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
#pragma once

#include <QtGlobal>

#if defined(Q_OS_WIN)
#include <openvr.h>

#include "../WindowOpenGLDisplayPlugin.h"

#define TARGET_RATE_OpenVr 90.0f;  // FIXME: get from sdk tracked device property? This number is vive-only.

class OpenVrDisplayPlugin : public WindowOpenGLDisplayPlugin {
public:
    virtual bool isSupported() const override;
    virtual const QString & getName() const override;
    virtual bool isHmd() const override { return true; }

    virtual float getTargetFrameRate() override { return TARGET_RATE_OpenVr; }
    virtual float getTargetFramePeriod() override { return 1.0f / TARGET_RATE_OpenVr; }

    virtual void activate() override;
    virtual void deactivate() override;

    virtual glm::uvec2 getRecommendedRenderSize() const override;
    virtual glm::uvec2 getRecommendedUiSize() const override { return uvec2(1920, 1080); }

    // Stereo specific methods
    virtual glm::mat4 getProjection(Eye eye, const glm::mat4& baseProjection) const override;
    virtual void resetSensors() override;

    virtual glm::mat4 getEyeToHeadTransform(Eye eye) const override;
    virtual glm::mat4 getHeadPose(uint32_t frameIndex) const override;

protected:
//    virtual void display(uint32_t frameIndex, uint32_t finalTexture, const glm::uvec2& sceneSize) override;
    virtual void customizeContext() override;

private:
    vr::IVRSystem* _hmd { nullptr };
    static const QString NAME;
};

#endif


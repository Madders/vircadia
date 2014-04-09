//
//  InputVertex.h
//  interface/src/starfield/data
//
//  Created by Tobias Schwinger on 3/29/13.
//  Copyright 2013 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

#ifndef __interface__starfield__data__InputVertex__
#define __interface__starfield__data__InputVertex__

#include "starfield/Config.h"

namespace starfield {

    class InputVertex {
    public:

        InputVertex(float azimuth, float altitude, unsigned color);

        float getAzimuth() const { return _azimuth; }
        float getAltitude() const { return _altitude; }
        unsigned getColor() const { return _color; } 

    private:
        unsigned _color;
        float _azimuth;
        float _altitude;
    }; 

    typedef std::vector<InputVertex> InputVertices;

}

#endif


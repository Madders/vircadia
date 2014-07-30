# 
#  FindLibOVR.cmake
# 
#  Try to find the LibOVR library to use the Oculus
#
#  You must provide a LIBOVR_ROOT_DIR which contains Lib and Include directories
#
#  Once done this will define
#
#  LIBOVR_FOUND - system found LibOVR
#  LIBOVR_INCLUDE_DIRS - the LibOVR include directory
#  LIBOVR_LIBRARIES - Link this to use LibOVR
#
#  Created on 5/9/2013 by Stephen Birarda
#  Copyright 2013 High Fidelity, Inc.
#
#  Distributed under the Apache License, Version 2.0.
#  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
# 

include("${MACRO_DIR}/HifiLibrarySearchHints.cmake")
hifi_library_search_hints("oculus")

find_path(LIBOVR_INCLUDE_DIRS OVR.h PATH_SUFFIXES Include HINTS ${OCULUS_SEARCH_DIRS})
find_path(LIBOVR_UTIL_INCLUDE_DIR Util_Render_Stereo.h PATH_SUFFIXES Src/Util HINTS ${OCULUS_SEARCH_DIRS})

# add the util include dir to the general include dirs
set(LIBOVR_INCLUDE_DIRS "${LIBOVR_INCLUDE_DIRS}" "${LIBOVR_UTIL_INCLUDE_DIR}")

include(SelectLibraryConfigurations)

if (APPLE)
  find_library(LIBOVR_LIBRARY_DEBUG ovr PATH_SUFFIXES Lib/MacOS/Debug HINTS ${OCULUS_SEARCH_DIRS})
  find_library(LIBOVR_LIBRARY_RELEASE ovr PATH_SUFFIXES Lib/MacOS/Release HINTS ${OCULUS_SEARCH_DIRS})
elseif (UNIX)
  find_library(UDEV_LIBRARY_RELEASE udev /usr/lib/x86_64-linux-gnu/)
  find_library(XINERAMA_LIBRARY_RELEASE Xinerama /usr/lib/x86_64-linux-gnu/)
  
  if (CMAKE_CL_64)
    set(LINUX_ARCH_DIR "i386")
  else()
    set(LINUX_ARCH_DIR "x86_64")
  endif()
  
  find_library(LIBOVR_LIBRARY_DEBUG ovr PATH_SUFFIXES Lib/Linux/Debug/${LINUX_ARCH_DIR} HINTS ${OCULUS_SEARCH_DIRS})
  find_library(LIBOVR_LIBRARY_RELEASE ovr PATH_SUFFIXES Lib/Linux/Release/${LINUX_ARCH_DIR}/ HINTS ${OCULUS_SEARCH_DIRS})
  
  select_library_configurations(UDEV)
  select_library_configurations(XINERAMA)
  
elseif (WIN32)   
  find_library(LIBOVR_LIBRARY_DEBUG ovrd PATH_SUFFIXES Lib/Win32 Lib/Win32/VS2010 HINTS ${OCULUS_SEARCH_DIRS})
  find_library(LIBOVR_LIBRARY_RELEASE ovr PATH_SUFFIXES Lib/Win32 Lib/Win32/VS2010 HINTS ${OCULUS_SEARCH_DIRS})
endif ()

select_library_configurations(LIBOVR)

set(LIBOVR_LIBRARIES "${LIBOVR_LIBRARIES}" "${UDEV_LIBRARY}" "${XINERAMA_LIBRARY}")

include(FindPackageHandleStandardArgs)
if (UNIX)
  find_package_handle_standard_args(LIBOVR DEFAULT_MSG LIBOVR_INCLUDE_DIRS LIBOVR_UTIL_INCLUDE_DIR LIBOVR_LIBRARIES)
elseif ()
  find_package_handle_standard_args(LIBOVR DEFAULT_MSG LIBOVR_INCLUDE_DIRS LIBOVR_UTIL_INCLUDE_DIR LIBOVR_LIBRARIES UDEV_LIBRARY XINERAMA_LIBRARY)
endif ()

mark_as_advanced(LIBOVR_INCLUDE_DIRS LIBOVR_LIBRARIES OCULUS_SEARCH_DIRS)
